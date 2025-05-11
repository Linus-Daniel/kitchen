import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

async function getBlogs() {
  // Fetch from your API
  return [
    {
      _id: "1",
      title: "10 Tips for Healthy Eating",
      excerpt: "Discover our top tips...",
      isPublished: true,
      publishedAt: new Date().toISOString(),
      author: { name: "Admin" },
    },
    // More blogs...
  ];
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">
            Manage your restaurant's blog content
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog._id}>
                <TableCell className="font-medium">
                  <Link 
                    href={`/admin/blog/${blog._id}`}
                    className="hover:underline"
                  >
                    {blog.title}
                  </Link>
                </TableCell>
                <TableCell>{blog.author.name}</TableCell>
                <TableCell>
                  <Badge variant={blog.isPublished ? "default" : "secondary"}>
                    {blog.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(blog.publishedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/blog/${blog._id}`}>
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}