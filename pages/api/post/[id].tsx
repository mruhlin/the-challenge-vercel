import prisma from '../../../lib/prisma';
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'

// DELETE /api/post/:id
export default async function handle(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const postId = req.query.id;
  if (req.method === 'DELETE') {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if(post?.author?.email == session.user?.email) {
      const deletedPost = await prisma.post.delete({
        where: { id: postId },
      });
      res.json(deletedPost);
    }
    else {
      throw new Error(
        `Current user (${session.user?.email}) does not own this post`
      )
    }
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}