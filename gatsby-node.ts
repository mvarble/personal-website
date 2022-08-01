import type { GatsbyNode } from 'gatsby';
import { resolve } from 'node:path';

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions: { setWebpackConfig },
}) => {
  setWebpackConfig({
    resolve: {
      alias: {
        '@components': resolve(__dirname, 'src', 'components'),
      },
    },
  });
};
