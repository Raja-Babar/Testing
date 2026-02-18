import { ITSectionNav } from "@/components/ITSectionNav"
import { DashboardNav } from "@/components/DashboardNav" // Agar aapne multi-role wala use karna hai
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar() {
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Aapka Logo/Branding yahan aayega */}
        <div className="p-4 font-black text-xs tracking-[0.3em] uppercase italic">
          MHPISSJ <span className="text-indigo-600">Portal</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Logic: Agar Admin hai toh DashboardNav dikhao, warna ITSectionNav */}
        {user?.role === 'Admin' ? (
          <DashboardNav /> 
        ) : (
          <ITSectionNav />
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* User Profile / Logout Button */}
      </SidebarFooter>
    </Sidebar>
  )
}