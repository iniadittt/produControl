import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
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

export default function ProductMergeDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    product: productSelect,
    categoriesWithTags,
    productInProduction,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    product: any;
    categoriesWithTags: CategoryWithTagsType[];
    productInProduction: any;
}>) {
    const appTitleArray: string[] = appTitle.split(" ");
    const title: string | undefined = appTitleArray.shift();
    const subTitle: string = appTitleArray.join(" ");
    const titleRev: string = subTitle + " " + title;

    const [dataExistName, setDataExistName] = useState<boolean>(false);
    const [dataExist, setDataExist] = useState<boolean>(false);
    const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
    const [errorMergeList, setErrorMergeList] = useState("");
    const [mergeListError, setMergeListError] = useState(true);
    const [maxQuantityError, setMaxQuantityError] = useState(false);
    const [countList, setCountList] = useState<number>(2);
    const [maxQuantity, setMaxQuantity] = useState<number>(
        productSelect.quantity
    );
    const [mergeList, setMergeList] = useState<
        Array<{ master_id: number | null; production_id: number | null }>
    >([
        {
            master_id: productSelect.master_id,
            production_id: productSelect.production_id,
        },
        {
            master_id: null,
            production_id: null,
        },
    ]);

    const { data, setData, reset, errors, processing, post, patch } = useForm<{
        sku: string;
        name: string;
        category_id: number | null;
        tags: number[];
        quantity: number;
        price: number;
        merge_list: Array<number | null>;
    }>({
        sku: "",
        name: "",
        category_id: null,
        tags: [],
        price: 0,
        quantity: 0,
        merge_list: [],
    });

    useEffect(() => {
        setData("tags", []);
    }, [data.category_id]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(
            route("production.merge.store", {
                id: Number(productSelect.master_id),
            }),
            {
                onSuccess: () =>
                    reset(
                        "sku",
                        "name",
                        "category_id",
                        "tags",
                        "quantity",
                        "price"
                    ),
            }
        );
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

    const changeMergeList = (value: any) => {
        const [urut, master_id, production_id] = value.split(" - ");
        setMergeList((prev) => {
            const newList = [...prev];
            newList[urut] = {
                master_id: Number(master_id),
                production_id: Number(production_id),
            };
            return newList;
        });
        const mergeListOK = mergeList.every((list) => {
            return list.master_id && list.production_id;
        });
        setMergeListError(mergeListOK);
    };

    useEffect(() => {
        const data = mergeList.map((list) => list.production_id);
        setData("merge_list", data);
        const isNull = mergeList.filter((list) => list === null);
        isNull.length > 0
            ? setErrorMergeList("Merge list masih ada yang kosong")
            : setErrorMergeList("");
        const productionIdList = mergeList
            .map((list) => list.production_id)
            .join(",");
        axios
            .get(route("api.production.max.quantity"), {
                params: { id: productionIdList },
            })
            .then((response) => {
                setMaxQuantity(response.data.data.max_quantity);
            })
            .catch(() => {
                setMaxQuantity(productSelect.quantity || 0);
            });
        return;
    }, [mergeList]);

    const debouncedName = useMemo(() => {
        return setTimeout(() => {
            axios
                .get(route("api.product.name"), {
                    params: {
                        sku: data.sku,
                    },
                })
                .then((response: any) => {
                    changeCategoryId(response.data.data.category[0].id);
                    setDataExistName(response.status === 200);
                    setData((prev) => ({
                        ...prev,
                        name: response.data.data.name,
                    }));
                })
                .catch(() => {
                    setDataExistName(false);
                    setData((prev) => ({
                        ...prev,
                        name: "",
                    }));
                });
        }, 2000);
    }, [data.sku]);

    useEffect(() => {
        return () => clearTimeout(debouncedName);
    }, [debouncedName]);

    const debouncedSku = useMemo(() => {
        return setTimeout(() => {
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
                        price: response.data.stock.price || 0,
                    }));
                })
                .catch(() => {
                    setDataExist(false);
                    setData((prev) => ({
                        ...prev,
                        price: 0,
                    }));
                });
        }, 2000);
    }, [data.category_id, data.tags]);

    useEffect(() => {
        return () => clearTimeout(debouncedSku);
    }, [debouncedSku]);

    useEffect(() => {
        if (countList > mergeList.length) {
            if (
                mergeList[mergeList.length - 1]?.master_id &&
                mergeList[mergeList.length - 1]?.production_id
            ) {
                setMergeList((prev) => [
                    ...prev,
                    {
                        master_id: null,
                        production_id: null,
                    },
                ]);
                setMergeListError(true);
            }
        }
        if (countList < mergeList.length) {
            setMergeList((prevList) => {
                if (countList > 1) {
                    return prevList.slice(0, -1);
                } else {
                    return [
                        {
                            master_id: productSelect.master_id,
                            production_id: productSelect.production_id,
                        },
                    ];
                }
            });
            setMergeListError(countList <= 2);
        }
    }, [countList]);

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
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setData("sku", event.target.value)}
                        />
                        <InputError message={errors.sku} className="mt-2" />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            disabled={dataExistName}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setData("name", event.target.value)}
                            className={`${
                                dataExistName && "font-semibold bg-gray-300"
                            }`}
                            value={data.name || ""}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
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
                        <div className="grid w-full lg:max-w-lg items-center gap-2">
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

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="category">
                            Produk Yang Ingin Digabung
                        </Label>
                        {mergeList.length > 2 && errorMergeList && (
                            <p className="text-xs text-red-600">
                                * {errorMergeList}
                            </p>
                        )}
                        <div className="flex gap-1">
                            <Button
                                disabled={countList > 1 && mergeListError}
                                onClick={(
                                    event: React.MouseEvent<HTMLButtonElement>
                                ) => {
                                    event.preventDefault();
                                    setCountList((prev) => prev + 1);
                                }}
                                className="text-xs mt-2 h-auto max-w-max"
                            >
                                +
                            </Button>

                            <Button
                                disabled={countList === 1}
                                onClick={(
                                    event: React.MouseEvent<HTMLButtonElement>
                                ) => {
                                    event.preventDefault();
                                    setCountList((prev) =>
                                        prev <= 2 ? 1 : prev - 1
                                    );
                                }}
                                className="text-xs mt-2 h-auto max-w-max"
                            >
                                -
                            </Button>
                        </div>

                        {Array.from({ length: countList }).map((_, index) => {
                            const allTag: string = productSelect.tags
                                ?.map(
                                    (tag: { id: number; name: string }) =>
                                        tag.name
                                )
                                .join(", ");
                            if (index === 0) {
                                return (
                                    <div
                                        key={index}
                                        className="rounded-md bg-gray-200 font-semibold"
                                    >
                                        <Select disabled>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={`${productSelect.sku} - ${productSelect.product_name} - ${productSelect.category_name} - ${allTag}`}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem
                                                        className="capitalize cursor-pointer text-black font-semibold"
                                                        value={`${productSelect.sku} - ${productSelect.product_name} - ${productSelect.category_name} - ${allTag}`}
                                                    >
                                                        {`${productSelect.sku} - ${productSelect.product_name} - ${productSelect.category_name} - ${allTag}`}
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={index}>
                                        <Select onValueChange={changeMergeList}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih produk yang ingin digabungkan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {productInProduction.map(
                                                        (product: any) => {
                                                            const selected =
                                                                mergeList.filter(
                                                                    (list) => {
                                                                        return (
                                                                            list.master_id ===
                                                                            product.master_id
                                                                        );
                                                                    }
                                                                );
                                                            const allTag: string =
                                                                product.tags
                                                                    ?.map(
                                                                        (tag: {
                                                                            id: number;
                                                                            name: string;
                                                                        }) =>
                                                                            tag.name
                                                                    )
                                                                    .join(", ");
                                                            return (
                                                                <SelectItem
                                                                    key={
                                                                        product.production_id
                                                                    }
                                                                    value={`${index} - ${product.master_id} - ${product.production_id}`}
                                                                    className="capitalize cursor-pointer"
                                                                    disabled={
                                                                        selected.length >
                                                                        0
                                                                    }
                                                                >
                                                                    {`${product.sku} - ${product.product_name} - ${product.category_name} - ${allTag}`}
                                                                </SelectItem>
                                                            );
                                                        }
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors?.merge_list}
                                            className="mt-2"
                                        />
                                    </div>
                                );
                            }
                        })}
                        {mergeList.length < 2 && (
                            <InputError
                                message="* Minimal memilih 2 product untuk digabungkan"
                                className="mt-2"
                            />
                        )}

                        {mergeListError && (
                            <InputError
                                message="* Product yang ingin digabungkan masih kosong"
                                className="mt-2"
                            />
                        )}
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="quantity">
                            Maksimal Jumlah Yang Bisa Digabung
                        </Label>
                        <Input
                            type="number"
                            id="quantity"
                            className="bg-gray-300 font-semibold"
                            value={maxQuantity}
                            disabled
                        />
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
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
                                if (quantityValue <= maxQuantity) {
                                    setData("quantity", quantityValue);
                                } else {
                                    setData("quantity", maxQuantity);
                                }
                                setMaxQuantityError(
                                    data.quantity > maxQuantity
                                );
                            }}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                        {maxQuantityError && (
                            <InputError
                                message="*Jumlah yang ingin digabung terlalu banyak melebihi Maksimal"
                                className="mt-2"
                            />
                        )}
                    </div>

                    <div className="grid w-full lg:max-w-lg items-center gap-2">
                        <Label htmlFor="price">Harga Satuan</Label>
                        <Input
                            type="text"
                            id="price"
                            disabled={dataExist}
                            className={`${
                                dataExist && "font-semibold bg-gray-300"
                            }`}
                            placeholder="contoh: 1000000"
                            value={formatCurrency(data.price)}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const value = event.target.value.replace(
                                    /\D/g,
                                    ""
                                );
                                setData("price", parseInt(value) || 0);
                            }}
                        />
                        <InputError message={errors.price} className="mt-2" />
                    </div>

                    {dataExist && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <p className="text-xs mt-2 text-red-600">
                                Data dengan SKU{" "}
                                <span className="font-semibold">
                                    {data.sku}
                                </span>{" "}
                                dan tag yang dipilih ditemukan. Jika Anda
                                melakukan merge, data ini akan dimasukkan ke
                                data tujuan yang memiliki sku dan tag yang sama!
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={
                            processing || maxQuantityError || mergeListError
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
