import React from 'react';
import { graphql } from 'gatsby';

import { updateClass } from '../utils/themes';
import useKeyboardShortcuts from '../hooks/use-keyboard-shortcuts';
import Navbar from '../components/navbar';
import { ContentContainer, Content, PreContent, PostContent } from '../components/content';
import PostTitle from '../components/post-title';

interface PostProps {
  data: {
    post: {
      title: string;
      slug: string;
      date: string;
    };
  };
}

export default function Post(props: React.PropsWithChildren<PostProps>) {
  useKeyboardShortcuts();
  const { children } = props;
  const { title, date } = props.data.post
  return (
    <div>
      <Navbar title={ `post: ${ title }` } />
      <ContentContainer>
        <PreContent />
        <Content className="pt-20">
          <PostTitle title={ title } date={ date } tags={ [1, 2, 3, 4].map(i => `test${i}`) } />
          <div>{ children }</div>
        </Content>
        <PostContent />
      </ContentContainer>
    </div>
  );
}

export function Head(props: PostProps) {
  React.useEffect(updateClass, []);
  return <>
    <title>{ `${props.data.post.title} | rodent.club` }</title>
  </>;
}

export const pageQuery = graphql`
  query($id: String!) {
    post(id: { eq: $id }) {
      title
      slug
      date
    }
  }
`;
