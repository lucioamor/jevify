#!/usr/bin/env node
// Product Hunt launch-day monitor for jevify.
// Polls the PH API v2 (GraphQL) and prints votes, comments and daily rank.
//
// Usage:
//   PH_TOKEN=<developer token> node launch/ph-monitor.mjs [slug] [intervalSeconds]
// Token: https://www.producthunt.com/v2/oauth/applications -> create app -> "Create Token".

const API = 'https://api.producthunt.com/v2/api/graphql';
const TOKEN = process.env.PH_TOKEN;
const SLUG = process.argv[2] || 'jevify';
const INTERVAL = Number(process.argv[3] || 300);
const MAX_PAGES = 10; // 20 posts per page -> ranks up to 200

if (!TOKEN) {
  console.error('Missing PH_TOKEN env var.');
  process.exit(1);
}

async function gql(query, variables) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// Start of the current Product Hunt day (00:00 America/Los_Angeles) as ISO string.
function phDayStart() {
  const tz = 'America/Los_Angeles';
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now); // YYYY-MM-DD
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
    .formatToParts(now)
    .find((p) => p.type === 'timeZoneName')
    .value.replace('GMT', ''); // e.g. -07:00
  return `${date}T00:00:00${offset}`;
}

const POST_QUERY = `
  query ($slug: String!) {
    post(slug: $slug) { name url votesCount commentsCount featuredAt createdAt }
  }`;

const RANK_QUERY = `
  query ($since: DateTime!, $after: String) {
    posts(order: RANKING, postedAfter: $since, first: 20, after: $after) {
      edges { node { slug votesCount } }
      pageInfo { hasNextPage endCursor }
    }
  }`;

async function findRank(slug) {
  const since = phDayStart();
  let after = null;
  let index = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const { posts } = await gql(RANK_QUERY, { since, after });
    for (const { node } of posts.edges) {
      index++;
      if (node.slug === slug) return index;
    }
    if (!posts.pageInfo.hasNextPage) break;
    after = posts.pageInfo.endCursor;
  }
  return null;
}

let lastVotes = null;

async function tick() {
  const time = new Date().toLocaleTimeString('pt-BR');
  try {
    const { post } = await gql(POST_QUERY, { slug: SLUG });
    if (!post) {
      console.log(`[${time}] post "${SLUG}" not found (not live yet?)`);
      return;
    }
    const rank = await findRank(SLUG);
    const delta = lastVotes === null ? '' : ` (${post.votesCount - lastVotes >= 0 ? '+' : ''}${post.votesCount - lastVotes})`;
    lastVotes = post.votesCount;
    console.log(
      `[${time}] #${rank ?? '?'}  votes ${post.votesCount}${delta}  comments ${post.commentsCount}` +
        (post.featuredAt ? '  featured' : ''),
    );
  } catch (err) {
    console.error(`[${time}] error: ${err.message}`);
  }
}

await tick();
setInterval(tick, INTERVAL * 1000);
