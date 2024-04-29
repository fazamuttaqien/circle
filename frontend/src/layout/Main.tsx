import { Fragment, ReactNode } from "react";
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Flex,
    Heading,
    Text,
    useDisclosure
} from "@chakra-ui/react"

import { BsFillArrowRightSquareFill } from "react-icons/bs";
import { Link } from "react-router-dom"

export default function Main({ children }: { children: ReactNode }) {
    // children ini adalah sebuah parameter yang khusu ada pada react untuk menangani setiap komponen yang ada di react
    // sehingga semua komponen bisa kita panggil pake si children

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <Fragment>
            <Flex color="white" h={"100vh"}>
                <p>Ini Sidebar</p>
                {children}
                <p>Ini isi dari Profile, suggested, watermark</p>

                <Button
                    display={{ base: "flex", lg: "none" }}
                    justifyContent={"center"}
                    alignItems={"center"}
                    color={"green"}
                    size={"sm"}
                    position={"fixed"}
                    bottom={"50vh"}
                    borderTopStartRadius={0}
                    borderBottomStartRadius={0}
                    py={5}
                    onClick={onOpen}
                >
                    <Text fontSize={"xl"}>
                        <BsFillArrowRightSquareFill />
                    </Text>
                </Button>

                <Drawer placement={"left"} onClose={onClose} isOpen={isOpen}>
                    <DrawerOverlay />
                    <DrawerContent bg={"#2B2B2B"}>
                        <DrawerCloseButton color={"white"} />
                        <DrawerHeader borderBottomWidth={"3px"}>
                            <Link to={"/"}>
                                <Heading
                                    as="h2"
                                    size="3xl"
                                    noOfLines={1}
                                    color={"#2C7865"}
                                    mb={4}
                                >
                                    Circle
                                </Heading>
                            </Link>
                        </DrawerHeader>
                        <DrawerBody mt={4} w={"100%"} p={0}>
                            <p>Ini Drawer yang ngeslide</p>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </Flex>
        </Fragment >
    )

}