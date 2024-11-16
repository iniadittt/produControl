import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import InputError from "@/Components/InputError";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import axios from "axios";

interface Delivery {
    id: number;
    delivery_id: number;
    master_id: number;
    invoice: string;
    product_name: string;
    product_price: number;
    product_quantity: number;
    sku: string;
    status_pengiriman: string;
    total_price: number;
    created_at: string;
    updated_at: string;
}

interface Tag {
    id: number;
    name: string;
}

interface ProductTujuanItem {
    stock_id: number;
    master_id: number;
    product_name: string;
    sku: string;
    stock_quantity: number;
    category_id: number;
    category_name: string;
    tags: Tag[];
    created_at: string;
    updated_at: string;
}

export default function DeliveryReturDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    delivery,
    stock,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    delivery: Delivery;
    stock: ProductTujuanItem[];
}>) {
    console.log({ stock });
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [categoryName, setCategoryName] = useState<string>("");
    const [listTag, setListTag] = useState<string[]>([]);
    const [tujuan, setTujuan] = useState<"production" | "stock" | "">("");

    const [productTujuan, setProductTujuan] = useState<ProductTujuanItem[]>([]);

    const { data, setData, reset, errors, processing, patch } = useForm<{
        delivery_id: number;
        stock_id: number | null;
        category_id: number | null;
        tags: number[];
        quantity: number;
    }>({
        delivery_id: delivery.delivery_id,
        stock_id: null,
        category_id: null,
        tags: [],
        quantity: 0,
    });

    const changeStockId = (value: string) => {
        const [stock_id, category_id, itemTags, listTagName, category_name] =
            value.split("-");
        const listTag = itemTags
            .split(", ")
            .map((tag: string) => parseInt(tag, 10))
            .filter((tag: number) => !isNaN(tag));
        const stockIdNumber = parseInt(stock_id, 10) || null;
        const categoryIdNumber = parseInt(category_id, 10) || null;
        setCategoryName(category_name);
        setListTag(listTagName.split(", "));
        setData((prev) => ({
            ...prev,
            stock_id: stockIdNumber,
            category_id: categoryIdNumber,
            tags: listTag,
        }));
    };

    console.log({ tujuan });

    useEffect(() => {
        console.log({ DELIVERY: delivery });
        console.log({ tujuan });
        axios
            .get("/dashboard/delivery/api/produt-tujuan", {
                params: {
                    sku: delivery.sku,
                    tujuan,
                },
            })
            .then((response: any) => {
                console.log(response.status);
                // setProductTujuan((prev) => ({
                //     ...prev,
                //     [...response.data.]
                // }))
            });
    }, [tujuan]);

    const submit = (e: any) => {
        e.preventDefault();
        // patch(route("delivery.retur.update"), {
        //     onSuccess: () =>
        //         reset("category_id", "stock_id", "tags", "quantity"),
        // });
    };

    const formatCurrency = (value: any) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={title!}
            breadcumb3={subTitle}
            breadcumb2Href={route("production.show")}
        >
            <Head title={titleRev} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{titleRev}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="invoice">Nomor Resi</Label>
                        <Input
                            type="text"
                            id="invoice"
                            placeholder="Masukkan nomor resi pengiriman"
                            value={delivery.invoice}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            value={delivery.sku}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            value={delivery.product_name}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="tujuan">Tujuan Retur</Label>
                        <Select
                            onValueChange={(value: "production" | "stock") =>
                                setTujuan(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih tujuan retur..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem
                                        value="production"
                                        className="capitalize cursor-pointer"
                                    >
                                        Production
                                    </SelectItem>
                                    <SelectItem
                                        value="stock"
                                        className="capitalize cursor-pointer"
                                    >
                                        Stock
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="category">Pilih Produk Tujuan</Label>
                        <Select
                            onValueChange={changeStockId}
                            disabled={!tujuan}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih produk tujuan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {productTujuan.map(
                                        (
                                            item: ProductTujuanItem,
                                            index: number
                                        ) => {
                                            const listTag = item.tags
                                                .map((item: Tag) => item.name)
                                                .join(", ");
                                            const listIdTag = item.tags
                                                .map((item: Tag) => item.id)
                                                .join(", ");
                                            return (
                                                <SelectItem
                                                    key={index}
                                                    value={`${item.stock_id}-${item.category_id}-${listIdTag}-${listTag}-${item.category_name}`}
                                                    className="capitalize cursor-pointer"
                                                >
                                                    {`${item.sku} - ${item.product_name} - Kategori: ${item.category_name} - Tags: ${listTag}`}
                                                </SelectItem>
                                            );
                                        }
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <InputError
                            message={errors.category_id}
                            className="mt-2"
                        />
                    </div>

                    {categoryName && (
                        <div className="grid w-full lg:max-w-lg items-center gap-2">
                            <Label htmlFor="categoryTujuan">
                                Kategori Tujuan
                            </Label>
                            <Input
                                type="text"
                                id="categoryTujuan"
                                placeholder="Kategory Tujuan"
                                value={categoryName}
                                className="bg-gray-300 font-semibold"
                                disabled
                            />
                        </div>
                    )}

                    {listTag?.length > 0 && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tags">Tag Tujuan</Label>
                            <ul className="list-disc pl-5">
                                {listTag.map((tag: string, index: number) => (
                                    <li key={index}>{tag}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="total_harga">Total Harga</Label>
                        <Input
                            type="text"
                            id="total_harga"
                            placeholder="Total Harga"
                            value={formatCurrency(delivery.product_price)}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="harga_satuan">Harga Satuan</Label>
                        <Input
                            type="text"
                            id="harga_satuan"
                            placeholder="Total Harga"
                            value={formatCurrency(
                                delivery.product_price /
                                    delivery.product_quantity
                            )}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="jumlah_delivery">Jumlah Produk</Label>
                        <Input
                            type="text"
                            id="jumlah_delivery"
                            placeholder="Jumlah Produk"
                            value={delivery.product_quantity}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-lg items-center gap-2">
                        <Label htmlFor="quantity">
                            Jumlah Produk Yang Diretur
                        </Label>
                        <Input
                            type="text"
                            id="quantity"
                            placeholder="contoh: 10"
                            value={data.quantity}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const value = event.target.value.replace(
                                    /\D/g,
                                    ""
                                );
                                const quantityValue = parseInt(value) || 0;
                                if (
                                    quantityValue <= delivery.product_quantity
                                ) {
                                    setData("quantity", quantityValue);
                                } else {
                                    setData(
                                        "quantity",
                                        delivery.product_quantity
                                    );
                                }
                            }}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            processing ||
                            !data.category_id ||
                            !data.stock_id ||
                            data.quantity === 0
                        }
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                            processing && "opacity-25"
                        } `}
                    >
                        SIMPAN
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
