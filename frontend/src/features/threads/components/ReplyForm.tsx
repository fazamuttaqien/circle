import { Button, ButtonSpinner, Input, Box, Flex } from "@chakra-ui/react";
import { Fragment, useRef, useState } from "react";
import { RiImageAddFill } from "react-icons/ri";
import { usePostReply } from "../hooks/useThreadsData";

export default function ReplyForm({ threadID }: { threadID: string }) {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  // const [image, setImage] = useState<{ file: File; preview: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = usePostReply(() => {
    setContent("");
    setImage(null); // reset the selected image after posting thread
  });

  const postReply = () => {
    const reply: ReplyPostType = {
      content,
      threadID,
    };
    if (image) {
      reply.image = image;
    }

    mutate(reply);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Fragment>
      <Flex alignItems={"center"} gap={"10px"}>
        <Input
          type="text"
          placeholder="Let's post new reply!"
          value={content}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setContent(event.target.value)
          }
          border={"none"}
        />
        <Box
          fontSize={"3xl"}
          color={"#04A51E"}
          cursor={"pointer"}
          onClick={handleImageClick}
        >
          <RiImageAddFill style={{ marginLeft: "10px", marginRight: "10px" }} />
        </Box>
        <Input
          type="file"
          name="image"
          onChange={handleFileChange}
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        {isPending ? (
          <Button px={"70px"} colorScheme="#04A51E" borderRadius={"full"}>
            <ButtonSpinner />
          </Button>
        ) : (
          <Button
            px={"30px"}
            colorScheme="green"
            borderRadius={"full"}
            onClick={postReply}
          >
            Reply
          </Button>
        )}
      </Flex>
    </Fragment>
  );
}
