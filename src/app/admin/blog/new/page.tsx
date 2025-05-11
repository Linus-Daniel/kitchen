import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function AddBlogPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
          <CardDescription>
            Fill out the form to publish a new article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Post title" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Short description"
                rows={2}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your content here..."
                rows={8}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Featured Image</Label>
              <Input id="image" type="file" accept="image/*" />
            </div>

            <div className="flex items-center gap-2">
              <Switch id="publish" />
              <Label htmlFor="publish">Publish immediately</Label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit">Save Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}