"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    try {
      const response = await axios.post("/api/suggest-messages", {
        prompt:
          "Generate three engaging and thought-provoking questions for an anonymous social messaging platform. The questions should be open-ended, encourage curiosity, and be suitable for a diverse audience. Avoid personal, sensitive, or controversial topics. Instead, focus on fun, creative, and universally relatable themes. Format the questions as a single string, separated by '||'.",
        model: "mistralai/Mistral-7B-Instruct-v0.1",
        max_tokens: 100,
      });

      const aiResponse = response.data.message;
      setSuggestedMessages(parseStringMessages(aiResponse));
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error fetching AI suggestions");
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast(`${response.data.message}`);
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error", {
        description:
          axiosError.response?.data.message ?? "Failed to send message",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="2xl:px-[200px] md:px-12 my-8 px-6 bg-white rounded">
      <h1 className="md:text-4xl text-2xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 flex flex-col justify-center items-center my-8">
        <div className="space-y-2">
          <p className="">Click on any message below to select it.</p>
        </div>
        <Card className="w-full">
          <CardHeader>
            <h3 className="text-xl text-center font-semibold">
              Suggested Messages
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {suggestedMessages.length > 0
              ? suggestedMessages.map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-max overflow-hidden flex justify-start items-start text-balance text-start"
                    onClick={() => handleMessageClick(message)}
                  >
                    {message}
                  </Button>
                ))
              : parseStringMessages(initialMessageString).map(
                  (message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-max flex justify-start items-start text-balance text-start"
                      onClick={() => handleMessageClick(message)}
                    >
                      {message}
                    </Button>
                  )
                )}
          </CardContent>
        </Card>
        <Button
          onClick={fetchSuggestedMessages}
          className="w-max"
          disabled={isSuggestLoading}
        >
          {isSuggestLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Suggest Messages
        </Button>
      </div>
      <div className="text-center">
        <div className="mb-4 text-lg font-semibold">Get Your Message Board</div>
        <Link href={"/sign-up"}>
          <Button variant="outline">Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
