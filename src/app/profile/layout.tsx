'use client';

import { useState } from 'react';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
                <ProfileSidebar />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header - Visible only on mobile */}
                <div className="md:hidden p-4 border-b flex items-center justify-between bg-card shrink-0">
                    <span className="font-bold text-lg">Profile</span>
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64 border-r-0">
                            <div className="sr-only">
                                <SheetTitle>Profile Menu</SheetTitle>
                            </div>
                            <ProfileSidebar className="border-none w-full h-full" onNavigate={() => setOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
