"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/User";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Bot, Loader2, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/common/Loader";

function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  const handleChatbox = () => {
    router.replace("/chat-box");
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-messages`);

      setValue("acceptMessages", response.data.isAcceptingMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error", {
        description:
          axiosError.response?.data.message ||
          "Failed to fetch message settings",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (session?.user) {
      fetchAcceptMessage();
    }
  }, [session, fetchAcceptMessage]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/get-messages`);
      setMessages(response.data.messages || []);
      if (refresh) {
        toast("Refreshed Messages", { description: "Showing latest messages" });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error", {
        description:
          axiosError.response?.data.message || "Failed to fetch messages",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchAcceptMessage();
    }
  }, [session, fetchAcceptMessage, fetchMessages]);

  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.post<ApiResponse>(`/api/accept-messages`, {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error", {
        description:
          axiosError.response?.data.message || "Failed to update settings",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const username = session?.user?.username ?? "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  const profileUrl = username ? `${baseUrl}/u/${username}` : "";

  const copyToClipboard = () => {
    navigator?.clipboard?.writeText(profileUrl);
    toast("URL copied", {
      description: "Profile URL has been copied to clipboard",
    });
    if (profileUrl) {
      window.open(profileUrl, "_blank");
    }
  };

  if (status === "loading") {
    return <Loader />;
  }

  return (
    <div className="bg-white rounded w-full 2xl:px-[200px] md:px-12 px-6 my-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="md:text-3xl text-xl font-bold ">Dashboard</h1>
        <Button variant="outline" onClick={handleChatbox}>
          <Bot className="!w-6 !h-6" />
          <p>Chat With AI</p>
        </Button>
      </div>

      <div className="mb-4">
        <h2 className="md:text-lg text-sm font-semibold mb-2">
          Copy Your Unique Link
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered md:text-lg text-sm w-full truncate"
          />
          <Button onClick={copyToClipboard} className="">
            Copy
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={() => fetchMessages(true)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Page;
