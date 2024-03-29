// we disable this rule because this file is only meant to be processed by Storybook. It is not part of our npm / CDN bundle.
// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars
import { Title, Subtitle, Description, Controls } from '@storybook/blocks';
// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars
import React from 'react';

export function AutodocsTemplate () {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Controls />
    </>
  );
}
