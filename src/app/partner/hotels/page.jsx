"use client";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";

import { FilePond, File, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import Image from "next/image";

registerPlugin(FilePondPluginImagePreview);

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const Page = () => {
  const user_token = Cookies.get("user_token");
  const [files, setFiles] = useState([]);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [inputData, setInputData] = useState({
    name: "",
    description: "",
    max_visitor: "",
    room_sizes: "",
    smoking_allowed: false,
    facilities: [],
    hotel_photos: [],
    overnight_prices: "",
    total_room: "",
    country: "",
    state: "",
    city: "",
    zip_code: "",
    complete_address: "",
    gmaps: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log(inputData);
  }, [inputData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(inputData).forEach((key) => {
      if (Array.isArray(inputData[key])) {
        inputData[key].forEach((item) => {
          formData.append(`${key}[]`, item);
        });
      } else {
        formData.append(key, inputData[key]);
      }
    });
    try {
      console.log(API_KEY);
      console.log(user_token);
      const response = await fetch(`${BASE_API}/partner/hotels/create`, {
        method: "POST",
        headers: {
          "X-Authorization": API_KEY,
          Authorization: `Bearer ${user_token}`,
        },
        cache: "no-store",
        body: formData,
      });

      if (response.ok) {
        console.log("success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="w-4/5 mx-auto">
        <div className="w-full mt-14 p-8 flex flex-row bg-white text-neutral-700 rounded-lg shadow-lg shadow-neutral-500/30 gap-4">
          <div className="basis-1/2">
            <div>
              <h2 className="text-lg font-semibold">Hotel Register</h2>
              <h4 className="text-sm opacity-90">
                Please fill out all the fields
              </h4>
            </div>
            <div className="my-8">
              <h2 className="opacity-90 mb-4">
                Upload your hotel pictures here!
              </h2>
              <FilePond
                files={files}
                onupdatefiles={setFiles}
                credits={false}
                allowMultiple={true}
                maxFiles={7}
                allowRevert={false}
                maxFileSize="3MB"
                acceptedFileTypes={["image/png", "image/jpg", "image/jpeg"]}
                name="file"
                required
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                server={{
                  url: `${BASE_API}/files/upload`,
                  process: {
                    headers: {
                      "X-Authorization": API_KEY,
                      Authorization: `Bearer ${user_token}`,
                    },
                    onload: (res) => {
                      const data = JSON.parse(res);
                      setInputData((prevData) => {
                        const updatedHotelPhotos = [...prevData.hotel_photos];
                        updatedHotelPhotos.push(data.data);
                        return {
                          ...prevData,
                          hotel_photos: updatedHotelPhotos,
                        };
                      });
                    },
                    onerror: (err) => console.error(err),
                  },
                }}
              />
            </div>
            <Image
              src={`/images/troll.jpg`}
              height={500}
              width={500}
              alt="troll"
            />
          </div>
          <div className="basis-1/2">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Input
                  label="Hotel Name"
                  variant="bordered"
                  name="name"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Textarea
                  label="Description"
                  variant="bordered"
                  disableAutosize
                  classNames={{
                    input: "resize-y min-h-[40px]",
                  }}
                  name="description"
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-row gap-4">
                <Input
                  type="number"
                  label="Max visitor each room"
                  variant="bordered"
                  name="max_visitor"
                  onChange={handleInputChange}
                />
                <Select
                  variant="bordered"
                  label="Smoke Allowed"
                  name="smoking_allowed"
                  value={inputData.smoking_allowed}
                  onChange={(event) =>{
                    console.log({event})
                    setInputData((prevData) => ({
                      ...prevData,
                      smoking_allowed: event.target.value,
                    }))}
                  }
                >
                  <SelectItem className="text-neutral-700" value={"0"} key={`0`}>
                    No
                  </SelectItem>
                  <SelectItem className="text-neutral-700" value={"1"} key={`1`}>
                    yes
                  </SelectItem>
                </Select>
              </div>
              <div>
                <CheckboxGroup
                  label="Select cities"
                  color="primary"
                  value={inputData.facilities}
                  onChange={(newValue) =>
                    setInputData((prevData) => ({
                      ...prevData,
                      facilities: newValue,
                    }))
                  }
                >
                  <Checkbox
                    value="Free WI-FI in all rooms!"
                    classNames={{
                      label: ["text-sm", "text-neutral-700"],
                    }}
                  >
                    Free WI-FI in all rooms!
                  </Checkbox>
                  <Checkbox
                    value="Coffee shop"
                    classNames={{
                      label: ["text-sm", "text-neutral-700"],
                    }}
                  >
                    Coffee shop
                  </Checkbox>
                  <Checkbox
                    value="Restaurants"
                    classNames={{
                      label: ["text-sm", "text-neutral-700"],
                    }}
                  >
                    Restaurants
                  </Checkbox>
                  <Checkbox
                    value="Room service [24-hour]"
                    classNames={{
                      label: ["text-sm", "text-neutral-700"],
                    }}
                  >
                    Room service [24-hour]
                  </Checkbox>
                  <Checkbox
                    value="Gym"
                    classNames={{
                      label: ["text-sm", "text-neutral-700"],
                    }}
                  >
                    Gym
                  </Checkbox>
                </CheckboxGroup>
              </div>
              <div className="flex flex-row gap-4">
                <Input
                  variant="bordered"
                  label="Overnight Price"
                  type="number"
                  name="overnight_prices"
                  onChange={handleInputChange}
                />
                <Input
                  variant="bordered"
                  label="Room Sizes (m^2)"
                  type="number"
                  name="room_sizes"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Input
                  variant="bordered"
                  label="Total Rooms"
                  type="number"
                  className="w-84"
                  name="total_room"
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-row gap-4">
                <Input
                  label="Country"
                  variant="bordered"
                  name="country"
                  onChange={handleInputChange}
                />
                <Input
                  label="State"
                  variant="bordered"
                  name="state"
                  onChange={handleInputChange}
                />
                <Input
                  label="City"
                  variant="bordered"
                  name="city"
                  onChange={handleInputChange}
                />
                <Input
                  label="Zip Code"
                  type="number"
                  variant="bordered"
                  name="zip_code"
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-row gap-4">
                <Textarea
                  label="Complete Address"
                  variant="bordered"
                  disableAutosize
                  classNames={{
                    input: "resize-y min-h-[40px]",
                  }}
                  name="complete_address"
                  onChange={handleInputChange}
                />
                <Input
                  label="Google Maps Link"
                  variant="bordered"
                  name="gmaps"
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" color="primary" size="lg">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
