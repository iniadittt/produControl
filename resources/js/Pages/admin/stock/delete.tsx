import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import InputError from "@/Components/InputError";
import { Checkbox } from "@/Components/ui/Checkbox";
import { useState } from "react";

export default function AddProductDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    stock,
    categoryStock,
    categoryWithTags,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    stock: any;
    categoryStock: any;
    categoryWithTags: any;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [checkedError, setCheckedError] = useState<string>("");
    const {
        data,
        errors,
        processing,
        delete: destroy,
    } = useForm({
        sku: stock.sku,
        product_name: stock.name,
        quantity: stock.quantity,
        price: stock.price,
        category_id: categoryStock.category_id,
        tags: categoryStock.tags.map(
            (tag: { id: number; name: string }) => tag.id
        ),
    });

    const submit = (e: any) => {
        e.preventDefault();
        if (!isChecked) {
            return setCheckedError("* Anda harus menyetujui terlebih dahulu");
        } else {
            setCheckedError("");
        }
        destroy(
            route("stock.destroy", {
                id: Number(stock.id),
            })
        );
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={title!}
            breadcumb3={"Hapus Produk"}
            breadcumb2Href={route("stock.show")}
        >
            <Head title={"Hapus Produk - Stock"} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">HAPUS PRODUK</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            className="bg-gray-300 font-semibold"
                            value={data.sku}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Nama Product</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            className="bg-gray-300 font-semibold"
                            value={data.product_name}
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Kategori</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Kategori"
                            className="bg-gray-300 font-semibold"
                            value={categoryStock.category_name}
                            disabled
                        />
                    </div>

                    {categoryWithTags.tags.length > 0 && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tag" className="mb-1">
                                Tags
                            </Label>
                            <div className="text-sm font-medium flex flex-col gap-2">
                                {categoryWithTags.tags.map(
                                    (tag: { id: number; name: string }) => (
                                        <div
                                            key={tag.id}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={tag.name}
                                                name="tags"
                                                value={tag.name}
                                                checked={data.tags.includes(
                                                    tag.id
                                                )}
                                                className="bg-gray-300 font-semibold"
                                                disabled
                                            />
                                            <Label
                                                htmlFor={tag.name}
                                                className="cursor-pointer"
                                            >
                                                {tag.name}
                                            </Label>
                                        </div>
                                    )
                                )}
                            </div>
                            <InputError
                                message={errors.tags}
                                className="mt-2"
                            />
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="quantity">Jumlah</Label>
                        <Input
                            type="text"
                            id="quantity"
                            placeholder="contoh: 10"
                            className="bg-gray-300 font-semibold"
                            value={data.quantity}
                            disabled
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                    </div>

                    {checkedError && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-red-600">
                                    {checkedError}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <div className="flex gap-2 items-center">
                            <Checkbox
                                id="aggree"
                                name="aggree"
                                className="cursor-pointer"
                                onCheckedChange={(checked) =>
                                    setIsChecked((prev) => !prev)
                                }
                            />
                            <Label htmlFor="aggree" className="cursor-pointer">
                                Saya setuju untuk menghapus data ini.
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || !isChecked}
                        className={`inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-red-900 ${
                            processing && "opacity-25"
                        } `}
                    >
                        DELETE
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
