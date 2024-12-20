import { makeStory, storyWait } from '../../stories/lib/make-story.js';
import './cc-addon-admin.js';

export default {
  tags: ['autodocs'],
  title: '🛠 Addon/<cc-addon-admin>',
  component: 'cc-addon-admin',
};

const conf = {
  component: 'cc-addon-admin',
};

/**
 * @typedef {import('./cc-addon-admin.js').CcAddonAdmin} CcAddonAdmin
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateLoaded} AddonAdminStateLoaded
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateLoading} AddonAdminStateLoading
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateError} AddonAdminStateError
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateUpdatingName} AddonAdminStateUpdatingName
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateUpdatingTags} AddonAdminStateUpdatingTags
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateDeleting} AddonAdminStateDeleting
 */

const addon = {
  name: 'Awesome addon (PROD)',
  tags: ['foo:bar', 'simple-tag'],
};

export const defaultStory = makeStory(conf, {
  items: [
    {
      /** @type {AddonAdminStateLoaded} */
      state: {
        type: 'loaded',
        ...addon,
      },
    },
  ],
});

export const loading = makeStory(conf, {
  tests: {
    visualRegressions: false,
  },
  items: [
    {
      /** @type {AddonAdminStateLoading} */
      state: {
        type: 'loading',
      },
    },
  ],
});

export const waitingWithUpdatingName = makeStory(conf, {
  tests: {
    visualRegressions: false,
  },
  items: [
    {
      /** @type {AddonAdminStateUpdatingName}*/
      state: {
        type: 'updatingName',
        ...addon,
      },
    },
  ],
});

export const waitingWithUpdatingTags = makeStory(conf, {
  tests: {
    visualRegressions: false,
  },
  items: [
    {
      /** @type {AddonAdminStateUpdatingTags}*/
      state: {
        type: 'updatingTags',
        ...addon,
      },
    },
  ],
});

export const waitingWithDeleting = makeStory(conf, {
  tests: {
    visualRegressions: false,
  },
  items: [
    {
      /** @type {AddonAdminStateDeleting}*/
      state: {
        type: 'deleting',
        ...addon,
      },
    },
  ],
});

export const dataLoadedWithDangerZoneVmAndBackups = makeStory(conf, {
  items: [
    {
      /** @type {AddonAdminStateLoaded} */
      state: {
        type: 'loaded',
        ...addon,
      },
    },
  ],
});

export const dataLoadedWithDangerZoneVmButNoBackups = makeStory(conf, {
  items: [
    {
      /** @type {AddonAdminStateLoaded} */
      state: {
        type: 'loaded',
        ...addon,
      },
      noDangerZoneBackupText: true,
    },
  ],
});

export const dataLoadedWithDangerZoneNoVmButBackups = makeStory(conf, {
  items: [
    {
      /** @type {AddonAdminStateLoaded} */
      state: {
        type: 'loaded',
        ...addon,
      },
      noDangerZoneVmText: true,
    },
  ],
});

export const dataLoadedWithDangerZoneNoVmNoBackups = makeStory(conf, {
  items: [
    {
      /** @type {AddonAdminStateLoaded} */
      state: {
        type: 'loaded',
        ...addon,
      },
      noDangerZoneBackupText: true,
      noDangerZoneVmText: true,
    },
  ],
});

export const errorWithLoading = makeStory(conf, {
  items: [
    {
      /** @type {AddonAdminStateError} */
      state: {
        type: 'error',
      },
    },
  ],
});

export const simulations = makeStory(conf, {
  tests: {
    visualRegressions: false,
    accessibility: false,
  },
  items: [{}, {}],
  simulations: [
    storyWait(
      2000,
      /** @param {CcAddonAdmin[]} components */
      ([component, componentError]) => {
        component.state = {
          type: 'loaded',
          name: addon.name,
          tags: addon.tags,
        };
        componentError.state = { type: 'error' };
      },
    ),
    storyWait(
      1000,
      /** @param {CcAddonAdmin[]} components */
      ([component]) => {
        component.state = {
          type: 'loaded',
          name: 'My new Addon Name',
          tags: addon.tags,
        };
      },
    ),
    storyWait(
      1000,
      /** @param {CcAddonAdmin[]} components */
      ([component]) => {
        component.state = {
          type: 'updatingName',
          name: 'My new Addon Name',
          tags: addon.tags,
        };
      },
    ),
    storyWait(
      1000,
      /** @param {CcAddonAdmin[]} components */
      ([component]) => {
        component.state = {
          type: 'loaded',
          name: 'My new Addon Name',
          tags: addon.tags,
        };
      },
    ),
    storyWait(
      1000,
      /** @param {CcAddonAdmin[]} components */
      ([component]) => {
        component.state = {
          type: 'loaded',
          name: 'My new Addon Name',
          tags: [...addon.tags, 'new-tag'],
        };
      },
    ),
    storyWait(
      1000,
      /** @param {CcAddonAdmin[]} components */
      ([component]) => {
        component.state = {
          type: 'updatingTags',
          name: 'My new Addon Name',
          tags: [...addon.tags, 'new-tag'],
        };
      },
    ),
    storyWait(
      1000,
      /** @param {CcAddonAdmin[]} components */
      ([component]) => {
        component.state = {
          type: 'loaded',
          name: 'My new Addon Name',
          tags: [...addon.tags, 'new-tag'],
        };
      },
    ),
    storyWait(
      1000,
      /** @param {CcAddonAdmin[]} components */
      ([component]) => {
        component.state = {
          type: 'deleting',
          name: 'My new Addon Name',
          tags: [...addon.tags, 'new-tag'],
        };
      },
    ),
  ],
});
