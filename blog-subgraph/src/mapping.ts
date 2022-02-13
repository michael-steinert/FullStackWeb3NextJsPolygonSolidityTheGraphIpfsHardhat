import {
    PostCreated as PostCreatedEvent,
    PostUpdated as PostUpdatedEvent
} from "../generated/Blog/Blog";
import {
    Post
} from "../generated/schema";
import {ipfs, json} from "@graphprotocol/graph-ts";

/* Event that handle when a new Post is created */
export function handlePostCreated(event: PostCreatedEvent): void {
    let post = new Post(event.params.id.toString());
    post.title = event.params.title;
    post.contentHash = event.params.hash;
    let data = ipfs.cat(event.params.hash);
    if (data) {
        let value = json.fromBytes(data).toObject();
        if (value) {
            const content = value.get("content");
            if (content) {
                post.postContent = content.toString();
            }
        }
    }
    post.createdAtTimestamp = event.block.timestamp;
    post.save();
}

/* Event that handle when a new Post is updated */
export function handlePostUpdated(event: PostUpdatedEvent): void {
    let post = Post.load(event.params.id.toString());
    if (post) {
        post.title = event.params.title;
        post.contentHash = event.params.hash;
        post.published = event.params.published;
        let data = ipfs.cat(event.params.hash);
        if (data) {
            let value = json.fromBytes(data).toObject();
            if (value) {
                const content = value.get("content");
                if (content) {
                    post.postContent = content.toString();
                }
            }
        }
        post.updatedAtTimestamp = event.block.timestamp;
        post.save()
    }
}
