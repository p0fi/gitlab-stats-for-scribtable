// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: code;

/* 
    GitLab Configuration
    
    Configure your gitlab credentials
    If you don't know how to obtain a personal access token see:
    https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token
*/
const GITLAB_URL = '';
const USERNAME = '';
const ACCESS_TOKEN = '';

/*
    Color Configuration

    Choose the colors of the text, background and icons
    Different settings for dark and light mode are possible
*/
function colorConfig() {
  // general
  const tintLogo = false; // set to true to color the gitlab logo
  const tintColor = new Color('#FC6D26');

  // dark mode
  const darkBackgroud = new Color('#1A1B1E');
  const darkText = new Color('#E3E3E3');

  // light mode
  const lightBackgroud = new Color('#FFFFFF');
  const lightText = new Color('#000000');

  return {
    bgColor: Color.dynamic(lightBackgroud, darkBackgroud),
    textColor: Color.dynamic(lightText, darkText),
    tintColor: tintColor,
    tintLogo: tintLogo,
  };
}

if (config.runsInWidget) {
  const size = config.widgetFamily;
  const widget = await createWidget(size);

  Script.setWidget(widget);
  Script.complete();
} else {
  // For debugging
  const size = 'small';
  //const size = 'medium'
  //const size = 'large'
  const widget = await createWidget(size);
  if (size == 'small') {
    widget.presentSmall();
  } else if (size == 'medium') {
    widget.presentMedium();
  } else {
    widget.presentLarge();
  }
  Script.complete();
}

async function createWidget(size) {
  const colors = colorConfig();
  const widget = new ListWidget();
  const data = await fetchData();

  // images
  const issueIconPath = await getImage('issues');
  const mrIconPath = await getImage('merge');
  const todoIconPath = await getImage('todo');
  const gitLabLogo = await getImage('gitlab-logo');
  const contrSymbol = await getImage('contrib');

  widget.backgroundColor = colors.bgColor;

  // small size
  if (size == 'small') {
    widget.setPadding(5, 0, 15, 0);

    const logo = widget.addImage(gitLabLogo);
    logo.imageSize = new Size(80, 30);
    logo.leftAlignImage();
    if (colors.tintLogo) {
      logo.tintColor = colors.tintColor;
    }

    widget.addSpacer();

    const contentStack = widget.addStack();
    contentStack.layoutHorizontally();

    contentStack.addSpacer();

    let leftColumn = contentStack.addStack();
    leftColumn.layoutVertically();

    contentStack.addSpacer();

    let rightColumn = contentStack.addStack();
    rightColumn.layoutVertically();

    contentStack.addSpacer();

    // left column
    addItem(issueIconPath, '', `${data.issues}`, '', leftColumn, size);
    leftColumn.addSpacer();
    addItem(todoIconPath, '', `${data.todos}`, '', leftColumn, size);

    // right column
    addItem(mrIconPath, '', `${data.mrs}`, '', rightColumn, size);
    rightColumn.addSpacer();
    addItem(contrSymbol.image, '', `${data.contributions}`, '', rightColumn, size);
  }
  // medium size
  else if (size == 'medium') {
    widget.setPadding(5, 0, 15, 0);

    const logo = widget.addImage(gitLabLogo);
    logo.imageSize = new Size(100, 40);
    logo.leftAlignImage();
    if (colors.tintLogo) {
      logo.tintColor = colors.tintColor;
    }

    widget.addSpacer();

    let contentStack = widget.addStack();
    contentStack.layoutHorizontally();

    contentStack.addSpacer();

    addItem(
      issueIconPath,
      'ISSUEs',
      `${data.issues}`,
      `${GITLAB_URL}/dashboard/issues?assignee_username=${USERNAME}`,
      contentStack,
      size
    );

    contentStack.addSpacer(30);

    addItem(todoIconPath, 'TODOs', `${data.todos}`, `${GITLAB_URL}/dashboard/todos`, contentStack, size);

    contentStack.addSpacer(30);

    addItem(
      mrIconPath,
      'MRs',
      `${data.mrs}`,
      `${GITLAB_URL}/dashboard/merge_requests?assignee_username=${USERNAME}`,
      contentStack,
      size
    );

    contentStack.addSpacer(30);

    addItem(contrSymbol.image, 'CONs', `${data.contributions}`, `${GITLAB_URL}/${USERNAME}`, contentStack, size);

    contentStack.addSpacer();

    widget.addSpacer();
  } else {
    const title = widget.addText(`size not supported`);
    title.font = Font.boldRoundedSystemFont(20);
    title.textColor = colors.textColor;
    title.centerAlignText();
  }
  return widget;
}

function addItem(img, description, count, link, stack, size) {
  const colors = colorConfig();
  if (size == 'small') {
    const line = stack.addStack();
    line.layoutVertically();
    line.url = link;

    const wimg = line.addImage(img);
    wimg.imageSize = new Size(20, 20);
    wimg.tintColor = colors.tintColor;

    line.addSpacer(3);
    const wname = line.addText(count);
    wname.font = Font.boldSystemFont(20);
    wname.textColor = colors.textColor;
  } else if (size == 'medium') {
    const item = stack.addStack();
    item.layoutVertically();
    item.url = link;

    const wimg = item.addImage(img);
    wimg.imageSize = new Size(30, 30);
    wimg.tintColor = colors.tintColor;

    const wname2 = item.addText(description);
    wname2.font = Font.thinRoundedSystemFont(13);
    wname2.textColor = colors.textColor;
    item.addSpacer(3);

    const wname = item.addText(count);
    wname.font = Font.boldSystemFont(25);
    wname.textColor = colors.textColor;
  }
}

async function fetchData() {
  let req = new Request(`${GITLAB_URL}/api/v4/issues?state=opened&scope=assigned_to_me&per_page=100`);
  req.headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
  let resp = await req.loadJSON();
  const assignedIssueCount = resp.length;

  req = new Request(`${GITLAB_URL}/api/v4/todos`);
  req.headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
  resp = await req.loadJSON();
  const todoCount = resp.length;

  req = new Request(`${GITLAB_URL}/api/v4/merge_requests?scope=assigned_to_me&state=opened`);
  req.headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
  resp = await req.loadJSON();
  const assingedMrCount = resp.length;

  const formatter = new DateFormatter();
  formatter.dateFormat = 'yyyy-MM-dd';
  const yesterday = formatter.string(new Date(Date.now() - 864e5));

  req = new Request(`${GITLAB_URL}/api/v4/users/${USERNAME}/events?after=${yesterday}`);
  req.headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
  resp = await req.loadJSON();
  const contribCount = resp.length;

  return {
    issues: assignedIssueCount,
    todos: todoCount,
    mrs: assingedMrCount,
    contributions: contribCount,
  };
}

async function getImage(name) {
  let data = '';
  switch (name) {
    case 'issues':
      data =
        'iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAANKADAAQAAAABAAAANAAAAABdv+0DAAAAHGlET1QAAAACAAAAAAAAABoAAAAoAAAAGgAAABoAAAIsDSC4nAAAAfhJREFUaAXUl79Lw0AUx6uDqAjq4A/Q2UFwqqCbi4ObDrq4ujpKJwX/DQddxL9B0FUHwcViJ4VY0jRplYhFwZ+N31f6atuQy7VpzV3hcUn67t33c+/dXZJICH6e5/UahjGSzWZHw4z8ZM113WHE7hEM3bm/SJRlWfv5fP4W9g3zumRfiHtt2/ZOsVgc6hxBXSSALGOQpy4BiCbGwJjzdVKiX2KmlhD0MwYYBi05jjMXnQQRTNMcAJAVIwxDpWndRoZCqW0rAMNQa5GBAHOmENAptAxGgkKAB4WAKFMmbLNtKHR+FgCtYH2NyRgW9biMocS3BONx6VF7CWt990OnQCAIXGh7pgI6YnLWJYEIqgz/I5xVkwHh/I8VB+KMlZDZVCaT6fMTND3RBIjB7gG22oTQeBsD0AbGZIHttucoxdlGkuqdpkA0Ee90hvqgNAaqZNcHpRhQuroLGtAlW44fuVxuppapGIACt23A3JAwfMb0Q9cu7FUS7CBOoMBNgYFYHF6cpwB0DCuHgNncJwHH/z5YpYFYJA74Rei8EkHRl3DFXwcgEkrnj6pAoWuIM8MtvSGgHO8EQI/sq0XJITspAQzthifaABUKhQkIfgkBSsYJ1FLJodQOQ2D+skNUcFZ2l4O2JOxHAPSGQ3W6lh0NgC4EMB6yt1cP8wsAAP//9D697QAAAdxJREFU7Zi/SgNBEMaDoEgasbBNq6WFaJfeVgzmBVKK+Ab6AD6Ab6Dpg42FvoBgcWDleXr/UDgtxEJIzm/BC5vNzuyeHNkLGBjcm2/c/X43u8kljQZecRy/I3JdpGm6I2qqfCVJsq9bS+Sg3RdrRVHUpep+80++7y8X9eO/EGcN1KGMFkDQm4hnqk7kUdsZQ8gDiLMGMnYI3TnhYKDdyAwTYwdAbIfgp4X4QmiPAfLDMAw3JyDkCxTUqkPYShcMjIA8l/1PjR0AkR2Cl08DzAeA16Yg5IQDIPIMGWBEd45l79qxAyCuQ9S5EfmHPM8XtRBy0gHQnzqErbYr+ybHcwI0IAFUYQ6AvvG5tK76Jq8dAJU9Q2ekeZ3gAKjMGXrNsmxF55vMOQAq06EeaZwSagx0h7fpBco3mXcAZLvl2qRpTnAAZNxyeFe75DyzGgeEiQ+gb1QcR5iPeyIQT9ot1jQn4p99wwLc4pVruImnnF+jBpirGgG9wEvTaJorwAS9ugChO13Oq5Xmed4SgB5rANW3MmxTBJgtBPe1t/KzotxALwiCVRuv1jV4PN/GIuwvLYqJSiCx7rXxW6g1hVIofufCPj6E8VvEG2JYIkaotQkxp5h7gNhTLPxfynfgB7vJu6KQnVjsAAAAAElFTkSuQmCC';
      break;
    case 'merge':
      data =
        'iVBORw0KGgoAAAANSUhEUgAAADQAAAA3CAYAAABD7GlFAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAANKADAAQAAAABAAAANwAAAAAaH5fTAAAAHGlET1QAAAACAAAAAAAAABwAAAAoAAAAHAAAABsAAALet93MngAAAqpJREFUaAXMlr1rFUEUxSOJCsYmIliKlRbBSuwESa2dEFIYCyEhVSBC/oMUIlhEEEEMNqK1Nmm0sBDEWFkYsNDCSLAQRCUJfjx/N+w8583eOzMbZt/zwmFn78c5c3aTeTs0NODodDrnwKUBb6OMPEYmwTaYKcM4QBZMLII/QKJdQwjsA+NAnuAVMAFGS/iHZxjcBn60ZwiVKbDuq1Xr71yXwdhejTE7Cp6AMMobQkGe3EqopNx/IHeyqSlmjoFXCp+kWjF0wxDT0u9JZr8pek8BmbGirCFUToPflpqRX855S8zKsfzF4HDp4obuOOYGV/mfih4U1N2xnKItbuhdStGoT1hviX7/WDbGu+mnrC6DoxZfozxE8uO2l5gOhSDRjuVc7p80Pgbmgwr11HsIvuYqBn2TPiE161gOxrJun9E17vNnrxl8kSVRb+oRpKz9xtSn8jM7tC5mG3GNDF3L1+h2rrt5d6VyArztdpRbPIBq2OkkrzQfBp8a6k9pxHCMgecNuXLaH9E0ommqOZrPg60cZnpWVJIqSf0gkA2Ujvsx3VoNdTG1EdmFfB3LF0Xy9dMjH7jXQU7Ib1puzNY2HkvAOhNhfh2b1WpwzYFfEU4pzYKL4I3cJOIb9eOalpqjOWZoTR1KJOG8AH4AK3a/FCgeADetJi//MCH5r8xQcUPCDu8ZsOltyl/2fPpQkK+MWMifft4XP42tGKpMWcd6j6Gq927MEbVb0peMNg2JOPxHQHisa4YO0fcRWPGZQvJwEsHW3pB7mmiEx3rNUGVeDotYnHWc5pXp1g1Vm/WPdcuQ/ODHjvQF04gr9MuQpyfH+lV3H16prQIr7oX9tXsm+/KGfGE09/v3/prakuWG/Krfq65p6rshdSNVkv3MRwy9jM3u1v5DQ40e8F8AAAD//wsyl8kAAAFqSURBVO2WMUoDQRSGQ0pB0EtYSa4Q8BRa2XmA5Bba2aXJbexygYCgFh7AQjBFWL+BLZws+7Jv/1+w8MFjM/tmvvneJsxmMjmIpmnuyL7YHEz/9SEimo8MMLco+8iA/4biJyA/YBkQ+6Wrso8MSCvHC2QfGRD7pauyjwxIK8cLZB8ZEPulq7KPDEgrxwtkHxkQ+6Wrso8MSCvHC2QfAA9kX7xQOIsVvFX2G+fDwim5Jo/FGxMuvNpdGntoPgDuj3Xyo/7K5/Ouhu+O5MPiGbknM/Ho069JSGg+AFaZTtq5n1xPahXPSPYB8NxKZi9XnhZqiuwD4CvbSTv/tlbxjGQfAB8jG7r2tFBTZB8ATyMbuqxVPCPZB8BiRENbj36XIvsAOCXfk03ddFU8dyw+QObkjhwSa496PwWJOan5tJDomyov3/Lfatqv4qtYfICUn9+SLAdFOf3KkV7eUyty5tMdRmLPP+UzzNo46xsSEjWYzhUyagAAAABJRU5ErkJggg==';
      break;
    case 'todo':
      data =
        'iVBORw0KGgoAAAANSUhEUgAAADUAAAAvCAYAAABDq4KNAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAANaADAAQAAAABAAAALwAAAADNKYDTAAAAHGlET1QAAAACAAAAAAAAABgAAAAoAAAAGAAAABcAAAIUJ3h88gAAAeBJREFUaAXklrFKBDEQhg8RLKzEwtpafABPxMoHsLO2tLCwsE7lM4i1LyByrecLiGDhCwgWoo1yIiqc38BtLpudza5skhMc+NlkMvPn/293s9fr/YcYj8dzYA9cgEfwDWLFO0RD0O/yW9K/BgZgBJ7BGVhSOVlYBTcgdXyywYYqoiFJ3yZ4VQTeklsotZMQQ09KcarUsCSgxQQhYugtIGjf0lAkj1yOO+TqGVkBLQY01t0hl/PUUpGVdyh3PFgBDQOEtTEk+k8sFRM5FHLHVIBVUh0gqumRK3TLgbZuGZjIKZczLtms/FJbNdMBNW3vkGg/mHYyIhE6tq9ZN5FwDM92afOaCXW/MXRYoYEgFKbSkDiBmG6GRF/IEWsmsYcSPfv1gfYd0mRW71DBplU7uWym2DOOITHmGNCGWUxFNfQXTEU3NGtTSQzN0lQyQ7MyldRQTFMIXQTzwhmK5IZkczYJhQkJnPTvQHA3Ifngeg6WtT7y3T+sGrGfm4ipuxi/3p3TtAW+lOZ7citebbzvkEusjRVBbspoPUWOwiu32BtbY+TzGRJxnhB/agoD2pXiF7/Bm4uxXdD9r48moC7nifCnpq5P8hSL6FhR/18uJEJba1BktJ4iR+9RQ3/b5WiGfgAAAP//m5Fb8wAAAWpJREFU7VY7agMxFDTGJ0iZLp1P4tK1T+GUaQLWXQIGly7S+wI+Q0hjSIr0BpNkBmTQ4nlP8sZrFLMPHqsdvc+MpBU7GMB+fAuMsQypQ/jKL5GdnVv1W+OZliFXGPkjeFthlxdEwn8VFWu0EdaNoEuJaiGsSBAWfAJ/gb/CF/A79soaAj0L2QJJAAqV7FipoGdB7B3YfdJSD0ViCgWdZaNI9oSVChqjzndKJBkv7e5xJglWw5AtIAJQiLfiE/wNvodv4VMRKiHEPsIt+5JJKWhlRjyksdcao3fweGV5eMksni3QQUAvSi1qv1NqVTrA+uOnFvVWj9/BEbaJR4FX7DWdfS07qM1pYMjcWdmV4ruGAPUC4utKyVu01kpHA0PmzMquFJ81BKgXEOd/Gv/N/oOR51DpOMEQ+AD/rFzVB3mekPeAKKzWHSOv8wQdxSKRR5HfGC8P3oredY/pzox92Z88yKfsyB2F3NrzF3y6jqq6t1NPAAAAAElFTkSuQmCC';
      break;
    case 'gitlab-logo':
      data =
        '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';
      break;
    case 'contrib':
      return SFSymbol.named('square.grid.4x3.fill');
    default:
      data = '';
      break;
  }
  return Image.fromData(Data.fromBase64String(data));
}
