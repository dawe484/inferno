'use server';

import { FilterQuery, SortOrder } from 'mongoose';

import Cult from '../models/cult.model';
import Inferno from '../models/inferno.model';
import User from '../models/user.model';

import { connectDB } from '../mongoose';

export async function createCult(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string // Change the parameter name to reflect it's an id
) {
  try {
    connectDB();

    // Find the user with the provided unique id
    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error('User not found'); // Handle the case if the user with the id is not found
    }

    const newCult = new Cult({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id, // Use the mongoose ID of the user
    });

    const createdCult = await newCult.save();

    // Update User model
    user.cults.push(createdCult._id);
    await user.save();

    return createdCult;
  } catch (error) {
    // Handle any errors
    console.error('Error creating cult:', error);
    throw error;
  }
}

export async function fetchCultDetails(id: string) {
  try {
    connectDB();

    const cultDetails = await Cult.findOne({ id }).populate([
      'createdBy',
      {
        path: 'members',
        model: User,
        select: 'name username image _id id',
      },
    ]);

    return cultDetails;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching cult details:', error);
    throw error;
  }
}

export async function fetchCultPosts(id: string) {
  try {
    connectDB();

    const cultPosts = await Cult.findById(id).populate({
      path: 'infernos',
      model: Inferno,
      populate: [
        {
          path: 'author',
          model: User,
          select: 'name image id', // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: 'children',
          model: Inferno,
          populate: {
            path: 'author',
            model: User,
            select: 'image _id', // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });

    return cultPosts;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching cult posts:', error);
    throw error;
  }
}

export async function fetchCults({
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectDB();

    // Calculate the number of cults to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, 'i');

    // Create an initial query object to filter cults.
    const query: FilterQuery<typeof Cult> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== '') {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched cults based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the cults based on the search and sort criteria.
    const cultsQuery = Cult.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate('members');

    // Count the total number of cults that match the search criteria (without pagination).
    const totalCultsCount = await Cult.countDocuments(query);

    const cults = await cultsQuery.exec();

    // Check if there are more cults beyond the current page.
    const isNext = totalCultsCount > skipAmount + cults.length;

    return { cults, isNext };
  } catch (error) {
    console.error('Error fetching cults:', error);
    throw error;
  }
}

export async function addMemberToCult(cultId: string, memberId: string) {
  try {
    connectDB();

    // Find the cult by its unique id
    const cult = await Cult.findOne({ id: cultId });

    if (!cult) {
      throw new Error('Cult not found');
    }

    // Find the user by their unique id
    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user is already a member of the cult
    if (cult.members.includes(user._id)) {
      throw new Error('User is already a member of the cult');
    }

    // Add the user's _id to the members array in the cult
    cult.members.push(user._id);
    await cult.save();

    // Add the cult's _id to the cults array in the user
    user.cults.push(cult._id);
    await user.save();

    return cult;
  } catch (error) {
    // Handle any errors
    console.error('Error adding member to cult:', error);
    throw error;
  }
}

export async function removeUserFromCult(userId: string, cultId: string) {
  try {
    connectDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const cultIdObject = await Cult.findOne({ id: cultId }, { _id: 1 });

    if (!userIdObject) {
      throw new Error('User not found');
    }

    if (!cultIdObject) {
      throw new Error('Cult not found');
    }

    // Remove the user's _id from the members array in the cult
    await Cult.updateOne(
      { _id: cultIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    // Remove the cult's _id from the cults array in the user
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { cults: cultIdObject._id } }
    );

    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error('Error removing user from cult:', error);
    throw error;
  }
}

export async function updateCultInfo(
  cultId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    connectDB();

    // Find the cult by its _id and update the information
    const updatedCult = await Cult.findOneAndUpdate(
      { id: cultId },
      { name, username, image }
    );

    if (!updatedCult) {
      throw new Error('Cult not found');
    }

    return updatedCult;
  } catch (error) {
    // Handle any errors
    console.error('Error updating cult information:', error);
    throw error;
  }
}

export async function deleteCult(cultId: string) {
  try {
    connectDB();

    // Find the cult by its ID and delete it
    const deletedCult = await Cult.findOneAndDelete({
      id: cultId,
    });

    if (!deletedCult) {
      throw new Error('Cult not found');
    }

    // Delete all threads associated with the cult
    await Inferno.deleteMany({ cult: cultId });

    // Find all users who are part of the cult
    const cultUsers = await User.find({ cults: cultId });

    // Remove the cult from the 'cults' array for each user
    const updateUserPromises = cultUsers.map((user) => {
      user.cults.pull(cultId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCult;
  } catch (error) {
    console.error('Error deleting cult: ', error);
    throw error;
  }
}
