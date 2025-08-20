"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../lib/api";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalRecords: 0,
    totalInstitutions: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        let promises = [];

        // Super Admin can access only institutions and users
        if (user?.role === "admin") {
          promises = [
            apiClient.getInstitutions({ page: 1, limit: 1 }),
            apiClient.getUsers({ page: 1, limit: 1 }),
          ];
        }
        // Institution Admin can only access patients, doctors, and medical records
        else if (user?.role === "admin_institutions") {
          const institutionParams = user?.institutionId
            ? { institutionId: user.institutionId }
            : {};
          const doctorParams = user?.institutionId
            ? { institutionIds: user.institutionId }
            : {};
          const recordParams = user?.institutionId
            ? { institutionFilter: "own" }
            : {};

          promises = [
            apiClient.getPatients({ page: 1, limit: 1, ...institutionParams }),
            apiClient.getDoctors({ page: 1, limit: 1, ...doctorParams }),
            apiClient.getMedicalRecords({ page: 1, limit: 1, ...recordParams }),
          ];
        }

        if (promises.length === 0) {
          setStats({
            totalPatients: 0,
            totalDoctors: 0,
            totalRecords: 0,
            totalInstitutions: 0,
            totalUsers: 0,
          });
          return;
        }

        if (user?.role === "admin") {
          const [i, u] = await Promise.all(promises);
          const totalInstitutions =
            i.pagination?.totalItems ||
            i.total ||
            i.data?.pagination?.totalItems ||
            0;
          const totalUsers =
            u.pagination?.totalItems ||
            u.total ||
            u.data?.pagination?.totalItems ||
            0;

          setStats({
            totalPatients: 0,
            totalDoctors: 0,
            totalRecords: 0,
            totalInstitutions,
            totalUsers,
          });
        } else if (user?.role === "admin_institutions") {
          const [p, d, r] = await Promise.all(promises);

          // Debug log to see what the patients API returns
          // eslint-disable-next-line no-console
          console.log("Patients API response:", p);

          // Try to extract total patients robustly
          let totalPatients =
            p?.pagination?.totalItems ??
            p?.total ??
            p?.data?.pagination?.totalItems ??
            p?.data?.total ??
            (Array.isArray(p?.data?.patients)
              ? p.data.patients.length
              : undefined) ??
            (Array.isArray(p?.data) ? p.data.length : undefined) ??
            (Array.isArray(p) ? p.length : 0);

          // If still undefined or not a number, fallback to 0
          if (typeof totalPatients !== "number" || isNaN(totalPatients)) {
            totalPatients = 0;
          }

          // Doctors and records as before
          const totalDoctors =
            d?.pagination?.totalItems ||
            d?.total ||
            d?.data?.pagination?.totalItems ||
            0;
          const totalRecords = r?.total || r?.data?.total || 0;

          setStats({
            totalPatients,
            totalDoctors,
            totalRecords,
            totalInstitutions: 0, // Institution admins can't see institution count
            totalUsers: 0,
          });
        }
      } catch (e) {
        console.error("Error loading stats:", e);
        setStats({
          totalPatients: 0,
          totalDoctors: 0,
          totalRecords: 0,
          totalInstitutions: 0,
          totalUsers: 0,
        });
      }
    };
    if (user) loadStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const colorMap = {
    blue: "bg-primary",
    green: "bg-secondary",
    purple: "bg-accent",
    orange: "bg-primary/70",
  };

  const StatCard = ({ title, value, icon, color }) => {
    const resolved = colorMap[color] || "bg-primary";
    return (
      <div className="bg-card rounded-lg shadow p-6 text-card-foreground">
        <div className="flex items-center">
          <div
            className={`p-3 rounded-full ${resolved} text-primary-foreground mr-4`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Super Admin sees only institutions and users */}
          {user?.role === "admin" && (
            <>
              <StatCard
                title="Institutions"
                value={stats.totalInstitutions}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"></path>
                  </svg>
                }
                color="orange"
              />
              <StatCard
                title="Users"
                value={stats.totalUsers || 0}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                  </svg>
                }
                color="blue"
              />
            </>
          )}

          {/* Institution Admin sees only patients, doctors, and records */}
          {user?.role === "admin_institutions" && (
            <>
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                  </svg>
                }
                color="blue"
              />
              <StatCard
                title="Total Doctors"
                value={stats.totalDoctors}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"></path>
                  </svg>
                }
                color="green"
              />
              <StatCard
                title="Medical Records"
                value={stats.totalRecords}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"></path>
                  </svg>
                }
                color="purple"
              />
            </>
          )}
        </div>

        {/* Institutions Overview */}
        {user?.role === "admin" && (
          <div className="bg-card text-card-foreground shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              System Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalInstitutions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Institutions
                </div>
              </div>
              <div className="bg-secondary/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-secondary">
                  {stats.totalUsers - 1}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Institution Admin Message */}
        {user?.role === "admin_institutions" && (
          <div className="bg-card text-card-foreground shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Institution Management
            </h3>
            <p className="text-muted-foreground">
              You can manage patients, doctors, and medical records for your
              institution. Use the navigation menu to access different sections
              and maintain healthcare data.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          {user?.role === "admin_institutions" && (
            <div className="bg-card text-card-foreground shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Recent Patients
              </h3>
              <div className="space-y-3">
                {/* Recent lists would need dedicated endpoints; keep placeholder empty state */}
                {[].map((patient) => (
                  <div
                    key={patient.patientId}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {patient.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {patient.email}
                      </div>
                    </div>
                  </div>
                ))}
                {[].length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No recent patients to display
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recent Medical Records */}
          {user?.role === "admin_institutions" && (
            <div className="bg-card text-card-foreground shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Recent Medical Records
              </h3>
              <div className="space-y-3">
                {[].map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {record.patientName || "Unknown Patient"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.visitType} - {record.visitDate}
                      </div>
                    </div>
                  </div>
                ))}
                {[].length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No recent records to display
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Admin Dashboard Sections */}
          {user?.role === "admin" && (
            <>
              <div className="bg-card text-card-foreground shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Institutions Management
                </h3>
                <p className="text-muted-foreground">
                  Manage healthcare institutions and their settings. Create new
                  institutions and monitor their status.
                </p>
              </div>

              <div className="bg-card text-card-foreground shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  User Management
                </h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    • Create institution admin accounts
                  </p>
                  <p className="text-muted-foreground">
                    • Manage user permissions
                  </p>
                  <p className="text-muted-foreground">
                    • Monitor system access
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
