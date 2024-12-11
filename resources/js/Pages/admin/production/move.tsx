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
import { Checkbox } from "@/Components/ui/Checkbox";
import axios from "axios";

interface CategoryWithTagsType {
    id: number;
    name: string;
    type: string;
    tags: {
        id: number;
        name: string;
        category_id: number;
        created_at: Date;
        updated_at: Date;
    }[];
    created_at: Date;
    updated_at: Date;
}

export default function ProductMoveDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    product,
    categoriesWithTags,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    product: any;
    categoriesWithTags: CategoryWithTagsType[];
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
    const [errorQuantity, setErrorQuantity] = useState(false);
    const [dataExist, setDataExist] = useState(false);

    const { data, setData, reset, errors, processing, post, patch } = useForm<{
        production_id: number;
        sku: string;
        category_id: number | null;
        tags: number[];
        quantity: number;
        price: number;
    }>({
        production_id: product.production_id,
        sku: product.sku,
        category_id: categoriesWithTags[0].id,
        tags: [],
        quantity: 0,
        price: 0,
    });

    useEffect(() => {
        setErrorQuantity(data.quantity > product.quantity);
    }, [data.quantity]);

    useEffect(() => {
        setData("tags", []);
    }, [data.category_id]);

    useEffect(() => {
        axios
            .get(route("api.stock.check.product.exist"), {
                params: {
                    sku: data.sku,
                    category_id: data.category_id,
                    tags: data.tags,
                },
            })
            .then((response: any) => {
                setDataExist(response.status === 200);
                setData((prev) => ({
                    ...prev,
                    price: response.data.stock.price,
                }));
            })
            .catch(() => {
                setDataExist(false);
                setData((prev) => ({
                    ...prev,
                    price: 0,
                }));
            });
    }, [data.tags]);

    const submit = (e: any) => {
        e.preventDefault();
        post(route("production.move.store"), {
            onSuccess: () => reset("sku", "tags", "quantity", "price"),
        });
    };

    const changeTagSelected = (checked: any, tagId: number) => {
        const updatedTags = checked
            ? [...data.tags, tagId]
            : data.tags.filter((tag) => tag !== tagId);
        setData("tags", updatedTags);
    };

    const changeCategoryId = (value: any) => {
        const filteredTags = categoriesWithTags
            .map((category) =>
                category.tags
                    .filter((tag) => tag.category_id === Number(value))
                    .map((tag) => ({ id: tag.id, name: tag.name }))
            )
            .flat();
        setTags(filteredTags);
        setData("category_id", Number(value));
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
                <h1 className="font-semibold uppercase">MOVE TO STOCK</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="Masukkan SKU"
                            value={data.sku}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                        <InputError message={errors.sku} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">Nama Produk</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="Masukkan SKU"
                            value={product.product_name}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                            onValueChange={changeCategoryId}
                            value={data.category_id?.toString()}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori produk" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {categoriesWithTags.map(
                                        (category: CategoryWithTagsType) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                                className="capitalize cursor-pointer"
                                            >
                                                {category.name}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <InputError
                            message={errors.category_id}
                            className="mt-2"
                        />
                    </div>

                    {tags.length > 0 && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tag" className="mb-1">
                                Tags
                            </Label>
                            <div className="text-sm font-medium flex flex-col gap-2">
                                {tags.map(
                                    (tag: { id: number; name: string }) => (
                                        <div
                                            key={tag.id}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={tag.name}
                                                name="tags"
                                                value={tag.name}
                                                className="cursor-pointer"
                                                onCheckedChange={(checked) =>
                                                    changeTagSelected(
                                                        checked,
                                                        tag.id
                                                    )
                                                }
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
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">
                            Maksimal Jumlah Yang Bisa Dipindahkan
                        </Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="Masukkan SKU"
                            value={product.quantity}
                            className="bg-gray-300 font-semibold"
                            disabled
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="quantity">Jumlah</Label>
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
                                if (quantityValue <= product.quantity) {
                                    setData("quantity", quantityValue);
                                } else {
                                    setData("quantity", product.quantity);
                                }
                            }}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                        {errorQuantity && (
                            <InputError
                                message="*Jumlah yang dimasukkan lebih besar dari pada jumlah yang ada di production"
                                className="mt-2"
                            />
                        )}
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="price">Harga Satuan</Label>
                        <Input
                            type="text"
                            id="price"
                            placeholder="contoh: 1000000"
                            className={`${
                                dataExist ? "font-semibold bg-gray-300" : ""
                            }`}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const value = event.target.value.replace(
                                    /\D/g,
                                    ""
                                );
                                setData("price", parseInt(value) || 0);
                            }}
                            value={formatCurrency(data.price)}
                            disabled={errorQuantity || dataExist}
                        />
                        <InputError message={errors.price} className="mt-2" />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            processing ||
                            errorQuantity ||
                            !data.production_id ||
                            !data.sku ||
                            !data.category_id ||
                            data.tags.length === 0 ||
                            !data.quantity ||
                            !data.price
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
