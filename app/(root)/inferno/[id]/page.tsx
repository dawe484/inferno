import InfernoCard from '@/components/cards/InfernoCard';
import Comment from '@/components/forms/Comment';
import { fetchInfernoById } from '@/lib/actions/inferno.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect('/onboarding');

  const inferno = await fetchInfernoById(params.id);

  return (
    <section className='relative'>
      <div>
        <InfernoCard
          key={inferno._id}
          id={inferno._id}
          currentUserId={user?.id || ''}
          parentId={inferno.parentId}
          content={inferno.text}
          author={inferno.author}
          cult={inferno.cult}
          createdAt={inferno.createdAt}
          comments={inferno.children}
        />
      </div>
      <div className='mt-7'>
        <Comment
          infernoId={inferno.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>
      <div className='mt-10'>
        {inferno.children.map((childItem: any) => (
          <InfernoCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user?.id || ''}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            cult={childItem.cult}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default Page;
