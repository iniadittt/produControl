import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/Card";
import { DataTableLogging } from "../Components/datatable/DataTableLogging";

interface Total {
    master_data: number;
    users: number;
    production: number;
    stock: number;
    delivery: number;
    categoryProduction: number;
    categoryStock: number;
    tagsProduction: number;
    tagsStock: number;
}

interface LogsType {
    user_id: number;
    user_name: string;
    log_action: string;
    log_category: string;
    log_sku: string;
    log_keterangan: string;
    log_createdAt: string;
}

export default function Dashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    total,
    loggingData,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    total: Total;
    loggingData: LogsType[];
}>) {
    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={appTitle}
        >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Pengguna
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">{total.users}</h1>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Product
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">
                            {total.master_data}
                        </h1>
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Production
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">
                            {total.production}
                        </h1>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">{total.stock}</h1>
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Kategori di Production
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">
                            {total.categoryProduction}
                        </h1>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Kategori di Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">
                            {total.categoryStock}
                        </h1>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Tags di Production
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">
                            {total.tagsProduction}
                        </h1>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Tags di Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">
                            {total.tagsProduction}
                        </h1>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="font-normal text-sm">
                            Total Delivery
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <h1 className="text-4xl font-bold">{total.delivery}</h1>
                    </CardContent>
                </Card>
            </div>
            <div className="p-4">
                <h1 className="text-2xl mb-4 font-semibold">Product Logs</h1>
                <DataTableLogging data={loggingData} />
            </div>
        </AdminLayout>
    );
}
