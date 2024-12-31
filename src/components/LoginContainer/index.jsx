"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils"
import { toast } from "sonner";
import Cookies from "js-cookie";
import Link from "next/link";
import { BASE_API } from "@/utilities/environtment";
import {
    IconBrandGoogle,
} from "@tabler/icons-react";
import { Modal, ModalBody, ModalContent, ModalHeader, Spinner, useDisclosure } from "@nextui-org/react";
import { useGoogleLogin } from "@react-oauth/google";

export function LogInContainer() {
    const [isLoading, setIsLoading] = useState(false)
    const [tempGoogleData, setTempGoogleData] = useState({
        email: "",
        name: "",
        avatar: "",
        google_sub: ""
    })
    const googleRegisterModal = useDisclosure()

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const inputData = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        if (!formValidation(inputData)) return;

        try {
            setIsLoading(true)
            const res = await fetch(BASE_API + "/auth/login", {
                method: "POST",
                body: JSON.stringify(inputData),
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });

            if (res.ok) {
                const data = await res.json()
                Cookies.set("user_jwt", data.data)
                toast.success("Login successful");
                location.replace('/')
            } else if (res.status == 403) {
                toast.error("Email lu belum lu verif boyy, lu bukan nabi");
            } else if (res.status == 404) {
                toast.error("Elu siapa ajgggg, email lu gaada");
            } else if (res.status == 401) {
                toast.error("Invalid email or password");
            } else if (res.status == 400) {
                toast.error("Bad Request");
            } else {
                toast.error("Something went wrong");
            }
        } catch (err) {
            toast.error("Connection error!");
        } finally {
            setIsLoading(false)
        }
    };

    const formValidation = (data) => {
        const { email, password } = data;

        if (!email || !password) {
            toast.error("All fields are required!");
            return false;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters!");
            return false;
        }

        return true;
    };

    const handleGoogleRegisterSubmit = async (e) => {
        e.preventDefault()

        const formData = new FormData(e.target);

        const inputData = {
            email: tempGoogleData.email,
            name: tempGoogleData.name,
            google_sub: tempGoogleData.google_sub,
            avatar: tempGoogleData.avatar,
            phone_number: formData.get("phone_number"),
            country: formData.get("country"),
            province: formData.get("province"),
            city: formData.get("city"),
            zip_code: formData.get("zip_code"),
            complete_address: formData.get("complete_address"),
        };

        if (!googleFormValidation(inputData)) return;

        try {
            setIsLoading(true)
            const res = await fetch(BASE_API + "/auth/google/register", {
                method: "POST",
                body: JSON.stringify(inputData),
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            })

            const data = await res.json()
            if (res.ok) {
                Cookies.set("user_jwt", data.data)
                toast.success("Login successful");
                location.replace('/')
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Connection error")
        } finally {
            setIsLoading(false)
        }
    }

    const googleFormValidation = (data) => {
        const requiredFields = [
            "email",
            "name",
            "google_sub",
            "phone_number",
            "country",
            "province",
            "city",
            "zip_code",
            "complete_address",
        ];

        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
            toast.error(`Missing fields: ${missingFields.join(", ")}`);
            return false;
        }

        return true;
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo = await fetch(
                    `https://www.googleapis.com/oauth2/v3/userinfo`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenResponse.access_token}`
                        },
                        method: "GET"
                    }
                );

                if (userInfo.ok) {
                    const data = await userInfo.json()

                    console.log({ data })

                    const res = await fetch(BASE_API + "/auth/google/login", {
                        method: "POST",
                        body: JSON.stringify({
                            email: data.email,
                            google_sub: data.sub
                        }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    const res_data = await res.json()
                    if (res.ok) {
                        Cookies.remove("token");
                        Cookies.set("token", res_data.body, { expires: 7 });
                        toast.success("Google login successful!");
                        location.replace("/predict");
                    } else if (res.status === 404) {
                        setTempGoogleData({
                            email: data.email,
                            google_sub: data.sub,
                            name: data.name,
                            avatar: data.picture,
                        })
                        googleRegisterModal.onOpen()
                    } else {
                        toast.error(res_data.message);
                    }
                }

            } catch (error) {
                console.error(error);
                toast.error("Failed to login with Google");
            }
        },
        onError: (error) => {
            toast.error("Google login failed");
        }
    });

    return (
        (<div
            className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 text-slate-900 bg-transparent">
            <h2 className="font-bold text-xl text-slate-900 ">
                Log In to Nganterin
            </h2>
            <p className="text-neutral-600 text-sm max-w-sm mt-2">
                While our login feature is still in the works, you can login now and start exploring the possibilities with Nganterin.
            </p>
            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" placeholder="projectmayhem@fc.com" type="email" />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" placeholder="••••••••" type="password" />
                    <p className="text-xs">*Password must be at least 8 characters</p>
                </LabelInputContainer>

                <button
                    className="bg-gradient-to-br relative flex flex-row gap-2 justify-center items-center group/btn from-sky-500 to-sky-700 text-white w-full rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit"
                    disabled={isLoading}

                >
                    <Spinner color="white" size="sm" className={!isLoading && "hidden"} />
                    Log In &rarr;
                    <BottomGradient />
                </button>
                <Link href={`/auth/register`} >
                    <p className="text-sm hover:underline my-2">
                        Doesn't have an account?
                        <span className="font-semibold">
                            {` `}Register here
                        </span>
                        !
                    </p>
                </Link>
                <div
                    className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

                <div className="flex flex-col space-y-4">
                    <button
                        className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-slate-900 rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                        type="button"
                        onClick={handleGoogleLogin}
                    // disabled
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                            Google
                        </span>
                        <BottomGradient />
                    </button>
                </div>
            </form>
            <Modal isOpen={googleRegisterModal.isOpen} onOpenChange={googleRegisterModal.onOpenChange} isDismissable={false} closeButton={<></>} backdrop="blur" radius="sm">
                <ModalContent className="text-slate-900">
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Complete your registration</ModalHeader>
                            <ModalBody>
                                <form className="mb-6" onSubmit={handleGoogleRegisterSubmit}>
                                    <LabelInputContainer className="mb-4">
                                        <Label htmlFor="phone_number">Phone Number</Label>
                                        <Input id="phone_number" name="phone_number" placeholder="(+62) 813 0000 0000" type="text" />
                                    </LabelInputContainer>
                                    <LabelInputContainer className="mb-4">
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" name="country" placeholder="AS" type="text" />
                                    </LabelInputContainer>
                                    <LabelInputContainer className="mb-4">
                                        <Label htmlFor="province">Province</Label>
                                        <Input id="province" name="province" placeholder="New Mexico" type="text" />
                                    </LabelInputContainer>
                                    <LabelInputContainer className="mb-4">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" placeholder="Albuquerque" type="text" />
                                    </LabelInputContainer>
                                    <LabelInputContainer className="mb-4">
                                        <Label htmlFor="zip_code">Zip Code</Label>
                                        <Input id="zip_code" name="zip_code" placeholder="87111" type="text" />
                                    </LabelInputContainer>
                                    <LabelInputContainer className="mb-8">
                                        <Label htmlFor="complete_address">Complete Address</Label>
                                        <Input id="complete_address" name="complete_address" placeholder="3828 Piermont Dr, Albuquerque, NM 87111" type="text" />
                                    </LabelInputContainer>

                                    <button
                                        className="bg-gradient-to-br relative flex flex-row gap-2 justify-center items-center group/btn from-sky-500 to-sky-700 text-white w-full rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                                        type="submit"
                                        disabled={isLoading}

                                    >
                                        <Spinner color="white" size="sm" className={!isLoading && "hidden"} />
                                        Register &rarr;
                                        <BottomGradient />
                                    </button>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>)
    );
}

const BottomGradient = () => {
    return (<>
        <span
            className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <span
            className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>);
};

const LabelInputContainer = ({
    children,
    className
}) => {
    return (
        (<div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>)
    );
};
