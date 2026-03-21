
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#FAFAFA]">
        <SidebarNav />
        <SidebarInset className="flex flex-col min-h-screen">
          <header className="flex h-14 items-center justify-between border-b bg-white px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8 text-slate-400 hover:text-slate-900 transition-colors" />
              <div className="h-4 w-px bg-slate-100 hidden md:block" />
              <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] hidden md:block">
                V1 Reader Edition
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-900 leading-none uppercase tracking-wider">Admin</p>
              </div>
              <Avatar className="h-7 w-7 border border-slate-100">
                <AvatarImage src={userAvatar?.imageUrl} />
                <AvatarFallback className="text-[10px] font-bold">AD</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-10 overflow-auto max-w-5xl mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
