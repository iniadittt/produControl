import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Button } from "@/Components/ui/Button";
import InputError from "@/Components/InputError";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/Select";
import { Checkbox } from "@/Components/ui/Checkbox";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AddProductDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    categoriesWithTags,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    categoriesWithTags: any;
}>) {
    const [tags, setTags] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [skuCategory, setSkuCategory] = useState<{
        id: number | undefined;
        name: string | undefined;
    }>({
        id: undefined,
        name: undefined,
    });
    const [skuTags, setSkuTags] = useState<
        {
            tag_id: number;
            tag_name: string;
        }[]
    >([]);

    const [dataExist, setDataExist] = useState(false);

    const { data, setData, reset, errors, processing, get, post } = useForm<{
        sku: string;
        name: string;
        category_id: number | null;
        quantity: number;
        tags: any[];
    }>({
        sku: "",
        name: "",
        category_id: 0,
        quantity: 0,
        tags: [],
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route("production.add.store"), {
            onSuccess: () => reset("name", "tags"),
        });
    };

    const debouncedSku = useMemo(() => {
        let handler: NodeJS.Timeout;
        if (data.sku) {
            handler = setTimeout(() => {
                setIsFetching(true);
                axios
                    .get(route("api.category"), {
                        params: { sku: data.sku },
                    })
                    .then((response: any) => {
                        setSkuCategory((prev) => ({
                            ...prev,
                            id: response.data.data.category.id,
                            name: response.data.data.category.name,
                        }));
                        setSkuTags(response.data.data.category.tags);
                        setData((prev) => ({
                            ...prev,
                            category_id: response.data.data.category.id,
                        }));
                    })
                    .catch(() => {
                        setSkuCategory((prev) => ({
                            ...prev,
                            id: undefined,
                            name: undefined,
                        }));
                        setSkuTags([]);
                        setData((prev) => ({
                            ...prev,
                            category_id: null,
                        }));
                    })
                    .finally(() => {
                        setIsFetching(false);
                    });
                axios
                    .get(route("api.product.name"), {
                        params: { sku: data.sku },
                    })
                    .then((response: any) => {
                        setData((prev) => ({
                            ...prev,
                            name: response.data.data.name,
                        }));
                    })
                    .catch(() => {
                        setData("name", "");
                    })
                    .finally(() => {
                        setIsFetching(false);
                    });
            }, 1000);
        }
        return () => clearTimeout(handler);
    }, [data.sku]);

    useEffect(() => {
        return debouncedSku;
    }, [debouncedSku]);

    useEffect(() => {
        axios
            .get(route("api.production.check.product.exist"), {
                params: {
                    sku: data.sku,
                    category_id: data.category_id,
                    tags: data.tags,
                },
            })
            .then((response: any) => {
                setDataExist(response.status === 200);
            })
            .catch(() => {
                setDataExist(false);
            });
    }, [data.tags]);

    const changeCategoryId = (value: any) => {
        const filteredTags = categoriesWithTags
            .map((category: any) =>
                category.tags
                    .filter((tag: any) => tag.category_id === Number(value))
                    .map((tag: any) => ({ id: tag.id, name: tag.name }))
            )
            .flat();
        setTags(filteredTags);
        setData("category_id", Number(value));
    };

    const changeTagSelected = (checked: any, tagId: number) => {
        const updatedTags = checked
            ? [...data.tags, tagId]
            : data.tags.filter((tag) => tag !== tagId);
        setData("tags", updatedTags as any);
    };

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Production"}
            breadcumb2Href={route("production.show")}
            breadcumb3={appTitle}
        >
            <Head title={appTitle} />
            <div className="p-4 pb-0">
                <h1 className="font-semibold uppercase">{appTitle}</h1>
            </div>
            <div className="p-4">
                <form onSubmit={submit} className="w-2/3 space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            type="text"
                            id="sku"
                            placeholder="SKU Product"
                            value={data.sku}
                            onChange={(e) => setData("sku", e.target.value)}
                        />
                        <InputError message={errors.sku} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="name">Nama Product</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Product Name"
                            value={data.name}
                            className={`${
                                skuCategory.id
                                    ? "font-semibold bg-gray-300"
                                    : ""
                            }`}
                            onChange={(e) => setData("name", e.target.value)}
                            disabled={skuCategory.id ? true : false}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                            onValueChange={changeCategoryId}
                            name="category"
                            value={
                                skuCategory.id
                                    ? skuCategory.id.toString()
                                    : data.category_id
                                    ? data.category_id.toString()
                                    : undefined
                            }
                            disabled={isFetching}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori production" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {skuCategory.id ? (
                                        <SelectItem
                                            key={skuCategory.id}
                                            value={skuCategory.id.toString()}
                                            className="capitalize cursor-pointer"
                                        >
                                            {skuCategory.name}
                                        </SelectItem>
                                    ) : (
                                        categoriesWithTags.map(
                                            (category: any) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                    className="capitalize cursor-pointer"
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            )
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

                    {(tags.length > 0 || skuTags.length > 0) && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label htmlFor="tag" className="mb-1">
                                Tags
                            </Label>
                            <div className="text-sm font-medium flex flex-col gap-2">
                                {skuTags.length > 0
                                    ? skuTags.map((tag: any) => (
                                          <div
                                              key={tag.tag_id}
                                              className="flex items-center gap-2"
                                          >
                                              <Checkbox
                                                  id={tag.tag_name}
                                                  name="tags"
                                                  value={tag.tag_name}
                                                  className="cursor-pointer"
                                                  onCheckedChange={(checked) =>
                                                      changeTagSelected(
                                                          checked,
                                                          tag.tag_id
                                                      )
                                                  }
                                              />
                                              <Label
                                                  htmlFor={tag.tag_name}
                                                  className="cursor-pointer"
                                              >
                                                  {tag.tag_name}
                                              </Label>
                                          </div>
                                      ))
                                    : tags.map(
                                          (tag: {
                                              id: number;
                                              name: string;
                                          }) => (
                                              <div
                                                  key={tag.id}
                                                  className="flex items-center gap-2"
                                              >
                                                  <Checkbox
                                                      id={tag.name}
                                                      name="tags"
                                                      value={tag.name}
                                                      className="cursor-pointer"
                                                      onCheckedChange={(
                                                          checked
                                                      ) =>
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
                            value={data.quantity}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setData("quantity", parseInt(value) || 0);
                            }}
                        />
                        <InputError
                            message={errors.quantity}
                            className="mt-2"
                        />
                    </div>

                    {dataExist && (
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <p className="text-xs mt-2 text-red-600">
                                Data dengan SKU{" "}
                                <span className="font-semibold">
                                    {data.sku}
                                </span>{" "}
                                dan tag yang dipilih ditemukan. Jika Anda
                                melakukan pembaruan, data ini akan dimasukkan ke
                                data tujuan yang memiliki sku dan tag yang sama!
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={processing || isFetching}
                        className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                            (processing || isFetching) && "opacity-25"
                        } `}
                    >
                        SIMPAN
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
