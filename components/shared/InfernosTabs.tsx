import { fetchUserPosts } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import InfernoCard from '../cards/InfernoCard';

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const InfernosTabs = async ({
  currentUserId,
  accountId,
  accountType,
}: Props) => {
  let result = await fetchUserPosts(accountId);

  if (!result) redirect('/');

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.infernos.map((inferno: any) => (
        <InfernoCard
          key={inferno._id}
          id={inferno._id}
          currentUserId={currentUserId}
          parentId={inferno.parentId}
          content={inferno.text}
          author={
            accountType === 'User'
              ? {
                  name: result.name,
                  image: result.image,
                  id: result.id,
                }
              : {
                  name: inferno.author.name,
                  image: inferno.author.image,
                  id: inferno.author.id,
                }
          }
          cult={inferno.cult} // TODO
          createdAt={inferno.createdAt}
          comments={inferno.children}
        />
      ))}
    </section>
  );
};

export default InfernosTabs;
