import {
  Button,
  ButtonSpinner,
  FormControl,
  Grid,
  GridItem,
  Input,
  Textarea,
  Box,
  Stack,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { Fragment, useRef, useState } from "react";
import { RiImageAddFill } from "react-icons/ri";
import { usePostThread } from "../hooks/useThreadsData";

interface CustomFile extends File {
  preview: string;
}

export default function ThreadForm() {
  const [content, setContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<{ file: File; preview: string }[]>([]);

  const { mutate, isPending } = usePostThread(() => {
    setContent("");
    setImage([]); // reset the selected image after posting thread
  });

  const postThread = () => {
    const thread: ThreadPostType = {
      content,
      image: image.map(({ file, preview }) => {
        const clonedFile: CustomFile = new File([file], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        }) as CustomFile;
        clonedFile.preview = preview;
        return clonedFile;
      }),
    };

    mutate(thread);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      Promise.all(
        filesArray.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({ file, preview: e.target?.result as string });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          });
        })
      ).then((images) => {
        setImage(
          (prevImages: { file: File; preview: string }[]) =>
            [...prevImages, ...images] as { file: File; preview: string }[]
        );
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImage((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Fragment>
      <Grid>
        <GridItem>
          <FormControl>
            <Textarea
              border={"none"}
              resize={"none"}
              w="100%"
              height={"100%"}
              placeholder="Let's post new thread!"
              value={content}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(event.target.value)
              }
              id="insertThread"
              borderRadius={"15"}
              color={"white"}
              focusBorderColor={"#1D1D1D"}
            />
          </FormControl>

          <Stack direction={["column", "row"]} spacing="24px" overflow={"auto"}>
            {image.map((images, index) => (
              <Box key={index} position="relative">
                <Image
                  src={images.preview}
                  alt={`${images.preview}@${index}`}
                  boxSize="150px"
                  objectFit="cover"
                  borderRadius={"lg"}
                />
                <IconButton
                  aria-label="Delete Image"
                  icon={<CloseIcon />}
                  onClick={() => handleRemoveImage(index)}
                  position="absolute"
                  top="1"
                  right="1"
                  zIndex="1"
                  size={"xs"}
                  borderRadius={"full"}
                  colorScheme="blackAlpha"
                />
              </Box>
            ))}
          </Stack>

          <Grid templateColumns="repeat(5, 1fr)" gap={4} mt={4}>
            <GridItem colSpan={2} h="10">
              <Box
                fontSize={"3xl"}
                color={"white"}
                cursor={"pointer"}
                onClick={handleAvatarClick}
              >
                <RiImageAddFill />
              </Box>
              <Input
                type="file"
                name="image"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                ref={fileInputRef}
              />
            </GridItem>
            <GridItem colStart={6} colEnd={6} h="10">
              {isPending ? (
                <Button px={"70px"} colorScheme="#04A51E" borderRadius={"full"}>
                  <ButtonSpinner />
                </Button>
              ) : (
                <Button
                  px={"30px"}
                  backgroundColor={"#04A51E"}
                  borderRadius={"full"}
                  color={"white"}
                  onClick={postThread}
                >
                  Post
                </Button>
              )}
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </Fragment>
  );
}
