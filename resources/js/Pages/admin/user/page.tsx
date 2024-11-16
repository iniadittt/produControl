import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { DataTable } from "@/Components/datatable/DataTableUser";
import { useState, useEffect } from "react";

export default function UserDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    users,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    users: any[];
}>) {
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        const dataUsers = users.map((user, index) => ({
            ...user,
            user_id: index + 1,
        }));
        setData(dataUsers);
    }, []);

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={appTitle}
        >
            <div className="p-4">
                <h1 className="font-semibold mb-4 uppercase">{appTitle}</h1>
                <DataTable data={data} />
            </div>
        </AdminLayout>
    );
}
