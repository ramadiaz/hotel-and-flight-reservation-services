
"use client";

import Loading from "@/app/loading";
import { BASE_API, MIDTRANS_CLIENT_KEY, MIDTRANS_SNAP_SCRIPT } from "@/utilities/environtment";
import fetchWithAuth from "@/utilities/fetchWIthAuth";
import { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Button, Checkbox, Image, Input } from "@nextui-org/react";
import { Sparkle } from "@phosphor-icons/react";
import { GetUserData } from "@/utilities/getUserData";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const Page = ({ params: id }) => {
  const [status, setStatus] = useState({
    loading: true,
  });
  const [detail, setDetail] = useState({});
  const [roomDetail, setRoomDetail] = useState({});
  const [images, setImages] = useState([]);
  const secdat = useSearchParams().get("secdat");
  const user_data = GetUserData()
  const router = useRouter()

  const [inputData, setInputData] = useState({
    hotel_id: id.id,
    room_id: null,
    check_in_date: "",
    check_out_date: "",
    special_request: "",
    is_for_someone_else: false
  })

  const fetchData = async (room_id) => {
    try {
      const response = await fetchWithAuth(`${BASE_API}/hotel/details?id=${id.id}`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setDetail(data.data);
        setImages(data.data.hotel_photos);

        const hotelRoom = data.data.hotel_rooms.find(room => room.id == room_id);

        if (!hotelRoom) {
          router.push(`/detail/hotel/${id.id}`)
        }

        setRoomDetail(hotelRoom)

        setStatus({ loading: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetchWithAuth(BASE_API + "/order/hotel/register", {
        method: "POST",
        body: JSON.stringify(inputData)
      })

      if (res.ok) {
        const data = await res.json()

        window.snap.pay(data.data.token, {
          onSuccess: async () => {
            toast('Pembayaran berhasil!');

            const jsonString = JSON.stringify(data.data);
            const secdat = btoa(jsonString)

            router.push(`/payment/hotel?secdat=${secdat}`)
          },
          onPending: () => {
            toast.warning('Payment pending');
            router.push("/order/history/hotel")
          },
          onError: () => {
            toast.error('Payment error');
            router.push("/order/history/hotel")
          },
          onClose: () => {
            toast.error('Payment window closed');
            router.push("/order/history/hotel")
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const parseSecdat = async () => {
      try {
        const jsonString = atob(secdat)
        const data = JSON.parse(jsonString);
        if (data) {
          fetchData(data.room_id)
          setInputData({
            ...inputData,
            room_id: data.room_id,
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date,
          })
        }
      } catch (err) {
        router.push(`/detail/hotel/${id.id}`)
      }
    }

    parseSecdat()

    const snapScript = MIDTRANS_SNAP_SCRIPT;
    console.log({ snapScript })
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [])

  return (
    <>
      <div className="bg-white min-h-screen text-neutral-700">
        {status.loading ? (
          <Loading />
        ) : (
          <div className="w-3/5 mx-auto flex flex-row gap-4 justify-center pt-12 transition-all duration-500">
            <div className="basis-2/3">
              <div className="border rounded-lg border-neutral-300 p-4 shadow-sm shadow-black/50 transition-all duration-500">
                <h2 className="font-semibold">Let us know who you are!</h2>
                <Input
                  label="Full name*"
                  required
                  labelPlacement="outside"
                  radius="sm"
                  variant="bordered"
                  size="lg"
                  value={user_data.name}
                  className="pt-4"
                  classNames={{
                    label: ["text-sm"],
                  }}
                  isDisabled
                />
                <Input
                  label="Email*"
                  type="email"
                  required
                  labelPlacement="outside"
                  radius="sm"
                  variant="bordered"
                  size="lg"
                  value={user_data.email}
                  placeholder="Enter your email"
                  className="pt-4"
                  classNames={{
                    label: ["text-sm"],
                  }}
                  isDisabled
                />
                <h3 className="mt-4 text-sm opacity-90">
                  If you enter your email address and do not complete your
                  reservation, we may send you reminders to help you resume your
                  booking.
                </h3>
                <div className="flex flex-row gap-4">
                  <Input
                    label="Phone number (optional)"
                    labelPlacement="outside"
                    radius="sm"
                    variant="bordered"
                    size="lg"
                    value={user_data.phone_number}
                    placeholder=" "
                    className="pt-4"
                    classNames={{
                      label: ["text-sm"],
                    }}
                    isDisabled
                  />
                  <Input
                    label="Country/region of residence*"
                    required
                    labelPlacement="outside"
                    radius="sm"
                    variant="bordered"
                    size="lg"
                    value={user_data.country}
                    placeholder=" "
                    className="pt-4"
                    classNames={{
                      label: ["text-sm"],
                    }}
                    isDisabled
                  />
                </div>
                <Checkbox
                  value={inputData.is_for_someone_else}
                  defaultSelected={inputData.is_for_someone_else}
                  onChange={(e) =>
                    setInputData({ ...inputData, is_for_someone_else: e.target.checked })
                  }
                  size="sm"
                  className="pt-8"
                >
                  Make this booking for someone else
                </Checkbox>
                <div
                  className={`border rounded-lg border-neutral-300 p-4 mt-4 ${inputData.is_for_someone_else ? "h-52" : "h-0 opacity-0"
                    } transition-all duration-500`}
                >
                  <Input
                    label="Full name*"
                    required
                    labelPlacement="outside"
                    radius="sm"
                    variant="bordered"
                    size="lg"
                    placeholder="Kimi no namae waaa"
                    classNames={{
                      label: ["text-sm"],
                    }}
                  />
                  <Input
                    label="Country/region of residence*"
                    required
                    labelPlacement="outside"
                    radius="sm"
                    variant="bordered"
                    size="lg"
                    placeholder=" "
                    className="pt-4"
                    classNames={{
                      label: ["text-sm"],
                    }}
                  />
                </div>
              </div>
              <div className="border rounded-lg border-neutral-300 p-4 shadow-sm shadow-black/50 transition-all duration-500 mt-4">
                <h2 className="font-semibold">Let us know who you are!</h2>
              </div>
              <div className="border rounded-lg border-neutral-300 p-4 shadow-sm shadow-black/50 transition-all duration-500 mt-4">
                <h3 className="text-sm">
                  By proceeding with this booking, I agree to Nganterin’s{` `}
                  <span className="text-sky-700">Terms of Use</span>
                  {` `}and{` `}
                  <span className="text-sky-700">Privacy Policy</span>.
                </h3>
                <h3 className="text-red-500 text-right text-sm mt-8">
                  Hurry! Our last room for your dates at this price
                </h3>
                <Button
                  color="primary"
                  size="lg"
                  onPress={() => {
                    setStatus((prev) => ({ ...prev, isPayment: true }));
                    handlePayment()
                  }}
                  isLoading={status.isPa}
                >
                  Payment
                </Button>
              </div>
            </div>
            <div className="basis-1/3 ">
              <div className="border rounded-lg border-neutral-300 p-4 shadow-sm shadow-black/50">
                <div className="flex flex-row gap-4">
                  <Image
                    src={images[0].url}
                    height={200}
                    width={200}
                    className="object-cover w-20 h-32"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-red-500 text-white px-2 py-1 text-xs">
                        Top Value
                      </div>
                      <div className="bg-red-500 text-white px-2 py-1 text-xs">
                        Best Seller
                      </div>
                    </div>
                    <div>
                      <h2 className="uppercase text-xl">{detail.name}</h2>
                      <ReactStars
                        count={5}
                        size={24}
                        activeColor="#ef4444"
                        edit={false}
                        value={3}
                      />
                      <h4 className="text-xs opacity-90">
                        {detail.complete_address}
                      </h4>
                      <div className="flex flex-row gap-1 mt-4">
                        <Sparkle size={18} />
                        <h5 className="font-semibold text-xs whitespace-nowrap">
                          Exceptional location{" "}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg border-neutral-300 p-4 shadow-sm shadow-black/50 mt-4 text-sm">
                <div className="border-b border-neutral-500/50 pb-4">
                  <div className="flex flex-row justify-between px-2 py-1">
                    <h3>Original Price</h3>
                    <h3 className="text-red-600 line-through">
                      Rp{" "}
                      {(
                        roomDetail.overnight_price + 300000
                      ).toLocaleString()}
                    </h3>
                  </div>
                  <div className="flex flex-row justify-between px-2 py-1">
                    <h3>Our Price</h3>
                    <h3 className="text-red-600 line-through">
                      Rp{" "}
                      {(
                        roomDetail.overnight_price + 100000
                      ).toLocaleString()}
                    </h3>
                  </div>
                  <div className="flex flex-row justify-between border border-dashed border-green-600 bg-green-200 px-2 py-1">
                    <h3>Instant Discount</h3>
                    <h3 className="text-green-600">-Rp 100.000</h3>
                  </div>
                  <div className="flex flex-row justify-between px-2 py-1">
                    <h3>Room price (1 room x 1 night)</h3>
                    <h3 className="">
                      Rp {roomDetail.overnight_price.toLocaleString()}
                    </h3>
                  </div>
                  <div className="flex flex-row justify-between px-2 py-1">
                    <h3>Booking Fees</h3>
                    <h3 className="font-semibold text-sky-600">FREE</h3>
                  </div>
                </div>
                <div className="pt-4 border-b border-neutral-500/50 pb-4">
                  <div className="flex flex-row justify-between px-2 py-1 text-medium">
                    <h3 className="font-semibold">Price</h3>
                    <h3 className="font-semibold">
                      Rp {parseInt(roomDetail.overnight_price).toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex flex-row justify-between px-2 py-1 text-xs">
                    <h3 className="">
                      Included in price: Service Charge 30%, Tax 10%, Service
                      charge 10%
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-gradient-to-b from-white to-orange-50 h-24"></div>
    </>
  );
};

export default Page;
