import React from 'react';

import firebase from 'gatsby-plugin-firebase';
import { isNode } from '@firebase/util';

export default function useDiscussions(slug) {
  const [postComment, setPostComment] = React.useState(() => {});
  const [comments, setComments] = React.useState([]);
  React.useEffect(() => {
    // if we are in node, no effect
    if (isNode()) return;

    // get a reference to the database at the level of the page
    const ref = firebase
      .database()
      .ref(`/discussion/${slug.replace("/", "__")}`);

    // subscribe to updates with a callback which updates the comment state
    ref.on(
      'value',
      snapshot => {
        const obj = snapshot.val() || {};
        const comments = Object.keys(obj)
          .map(key => ({ key, ...obj[key] }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .reduce(
            (arr, comment) => (
              comment.repliedTo
              ? arr.map(c => tryInsert(c, comment))
              : [...arr, comment]
            ),
            [],
          );
        setComments(comments);
      },
      () => setComments([]),
    );

    // bind the `postComment` callback to that of pushing a reference to the db
    setPostComment(() => (payload => {
      ref.push({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        ...payload,
      });
    }));

    // return the firebase resource cleanup
    return () => ref.off('value');
  }, [slug, setPostComment]);
  return { comments, postComment };
}

function tryInsert(comment, child) {
  if (comment.key === child.repliedTo) {
    return {
      ...comment,
      children: [
        ...(comment.children || []),
        child,
      ]
    };
  } else if (Array.isArray(comment.children) && comment.children.length) {
    return {
      ...comment,
      children: comment.children.map(c => tryInsert(c, child)),
    };
  } else {
    return comment;
  }
}
