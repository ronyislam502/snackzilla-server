import { Types } from "mongoose";

export type TBlog = {
    user: Types.ObjectId;
    title: string;
    description: string;
    image?: string;
    tags: string[];
    isDeleted: boolean;
}