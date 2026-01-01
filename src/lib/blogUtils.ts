export interface BlogPost {
    id: string;
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    richDescription?: string;
    author: string;
    date: string;
    category: string;
    categorySlug: string;
    image: string;
    featured?: boolean;
    tags?: string[];
    views?: number;
    readTime?: number;
    status?: string;
}

// Fetch blog post by slug from API
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const response = await fetch(`http://localhost:3000/api/blog/posts`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog posts');
        }
        const posts: BlogPost[] = await response.json();
        const post = posts.find(p => p.slug === slug);
        return post || null;
    } catch (error) {
        console.error('Error fetching blog post by slug:', error);
        return null;
    }
}

// Fetch related posts from API
export async function fetchRelatedPosts(postId: string, categorySlug: string): Promise<BlogPost[]> {
    try {
        const response = await fetch(`http://localhost:3000/api/blog/posts?category=${categorySlug}`);
        if (!response.ok) {
            throw new Error('Failed to fetch related posts');
        }
        const posts: BlogPost[] = await response.json();
        // Filter out the current post and limit to 3 related posts
        return posts.filter(p => p.id !== postId && p._id !== postId).slice(0, 3);
    } catch (error) {
        console.error('Error fetching related posts:', error);
        return [];
    }
}