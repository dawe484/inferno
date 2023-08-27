'use server';

import { revalidatePath } from 'next/cache';
import Inferno from '../models/inferno.model';
import User from '../models/user.model';
import { connectDB } from '../mongoose';

interface Params {
  text: string;
  author: string;
  cultId: string | null;
  path: string;
}

export async function createInferno({ text, author, cultId, path }: Params) {
  try {
    connectDB();

    const createInferno = await Inferno.create({
      text,
      author,
      cult: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { infernos: createInferno._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating inferno: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectDB();

  // Calculate the number of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  const postsQuery = Inferno.find({
    parentId: { $in: [null, undefined] },
  })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({
      path: 'children',
      populate: {
        path: 'author',
        model: User,
        select: '_id name parentId image',
      },
    });

  const totalPostsCount = await Inferno.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchInfernoById(id: string) {
  connectDB();

  try {
    // TODO: Populate Cult
    const inferno = await Inferno.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id id name parentId image',
          },
          {
            path: 'children',
            model: Inferno,
            populate: {
              path: 'author',
              model: User,
              select: '_id id name parentId image',
            },
          },
        ],
      })
      .exec();

    return inferno;
  } catch (error: any) {
    throw new Error(`Error fetching inferno: ${error.message}`);
  }
}

export async function addCommentToInferno(
  infernoId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectDB();

  try {
    // Find the original inferno (thread) by its ID
    const originalInferno = await Inferno.findById(infernoId);

    if (!originalInferno) throw new Error('Inferno not found');

    // Create a new inferno with the comment text
    const commentInferno = new Inferno({
      text: commentText,
      author: userId,
      parentId: infernoId,
    });

    // Save the new inferno
    const savedCommentInferno = await commentInferno.save();

    // Update the original inferno to include the new comment
    originalInferno.children.push(savedCommentInferno._id);

    // Save the original inferno
    await originalInferno.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to inferno: ${error.message}`);
  }
}
