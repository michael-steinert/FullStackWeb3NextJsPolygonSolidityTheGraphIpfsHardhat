# TheGraph

* Generate the Entities locally to start using in the Mappings created by the CLI: `graph codegen`
* Build the Subgraph: `graph build`
* Deploy built Subgraph: `graph auth https://api.thegraph.com/deploy/ >ACCESS_TOKEN>` and `yarn deploy`

## Queries
* Query to get a List of Posts:
```graphql
{
  posts {
  id
  title
  contentHash
  published
  postContent
  }
}
```

* Query to get a List of Posts and configure the Order Direction by Creation Date:
```graphql
{
  posts(
    orderBy: createdAtTimestamp
    orderDirection: desc
  ) {
    id
    title
    contentHash
    published
    postContent
  }
}
```

* Do a Full Text Search on the Post Title or Content:
```graphql
{
  postSearch(
    text: "Hello"
  ) {
    id
    title
    contentHash
    published
    postContent
  }
}
```