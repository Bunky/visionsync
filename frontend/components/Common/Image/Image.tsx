import NextImage from 'next/image';

const customLoader = ({ src }) => src;

export default (props) => (
  <NextImage
    {...props}
    loader={customLoader}
  />
);
