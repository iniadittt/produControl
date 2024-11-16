import * as React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/Components/ui/Sidebar";
import { Link } from "@inertiajs/react";

const data = {
    navMain: [
        {
            title: "Aplikasi",
            url: route("dashboard.show"),
            items: [
                {
                    title: "Dashboard",
                    url: route("dashboard.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("dashboard.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Kategori & Tag",
                    url: route("category.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("category.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Production",
                    url: route("production.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("production.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Stock",
                    url: route("stock.show"),
                    isActive:
                        route(`${route().current()}`) === route("stock.show"),
                    roleAvailable: "all",
                },
                {
                    title: "Delivery",
                    url: route("delivery.show"),
                    isActive:
                        route(`${route().current()}`) ===
                        route("delivery.show"),
                    roleAvailable: "all",
                },
                {
                    title: "User",
                    url: route("user.show"),
                    isActive:
                        route(`${route().current()}`) === route("user.show"),
                    roleAvailable: "admin",
                },
            ],
        },
    ],
};

const bg = "bg-slate-900";

export function AppSidebar({
    title,
    role,
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="sidebar" {...props} className={bg}>
            <SidebarHeader className={bg}>
                <a
                    href={route("dashboard.show")}
                    className="font-semibold text-center py-4 text-white text-2xl"
                >
                    {title}
                </a>
            </SidebarHeader>
            <SidebarContent className={bg}>
                {data.navMain.map((item: any) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel className="text-gray-500">
                            {item.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item: any) => {
                                    if (
                                        item.roleAvailable === "all" ||
                                        role === "admin" ||
                                        item.roleAvailable === role
                                    )
                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton asChild>
                                                    <Link
                                                        href={item.url}
                                                        className="text-gray-200 hover:text-slate-800"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail className={bg} />
        </Sidebar>
    );
}
