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
  const tintLogo = false; // set to true to color the gitlab logo
  const tintColor = new Color('#FC6D26');

  const [bgColor, textColor] = isDarkMode
    ? // dark mode
      [new Color('#1A1B1E', 1), new Color('#E3E3E3')]
    : // light mode
      [new Color('#ffffff', 1), new Color('#000000')];

  return {
    bgColor: bgColor,
    textColor: textColor,
    tintColor: tintColor,
    tintLogo: tintLogo,
  };
}

const isDarkMode = Device.isUsingDarkAppearance(); // set this to true/false during debugging

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
  const issueIconPath = await getAsset('issues.png');
  const mrIconPath = await getAsset('merge.png');
  const todoIconPath = await getAsset('todo.png');
  const gitLabLogo = await getAsset('gitlab-logo');
  const contrSymbol = SFSymbol.named('square.grid.4x3.fill');

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

async function getAsset(name) {
  if (name == 'gitlab-logo') {
    if (isDarkMode) {
      name = 'gitlab-logo-white.png';
    } else {
      name = 'gitlab-logo-gray.png';
    }
  }
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir + '/gitlab-stats/assets', name);
  let download = await fm.downloadFileFromiCloud(path);
  let isDownloaded = await fm.isFileDownloaded(path);

  if (fm.fileExists(path)) {
    return fm.readImage(path);
  } else {
    console.log('Error: File does not exist.');
  }
}

async function fetchData() {
  let resp = await new Request(
    `${GITLAB_URL}/api/v4/issues?state=opened&scope=assigned_to_me&per_page=100&private_token=${ACCESS_TOKEN}`
  ).loadJSON();
  const assignedIssueCount = resp.length;

  resp = await new Request(`${GITLAB_URL}/api/v4/todos?private_token=${ACCESS_TOKEN}`).loadJSON();
  const todoCount = resp.length;

  resp = await new Request(
    `${GITLAB_URL}/api/v4/merge_requests?scope=assigned_to_me&state=opened&private_token=${ACCESS_TOKEN}`
  ).loadJSON();
  const assingedMrCount = resp.length;

  const formatter = new DateFormatter();
  formatter.dateFormat = 'yyyy-MM-dd';
  const yesterday = formatter.string(new Date(Date.now() - 864e5));

  resp = await new Request(
    `${GITLAB_URL}/api/v4/users/${USERNAME}/events?after=${yesterday}&private_token=${ACCESS_TOKEN}`
  ).loadJSON();
  const contribCount = resp.length;

  return {
    issues: assignedIssueCount,
    todos: todoCount,
    mrs: assingedMrCount,
    contributions: contribCount,
  };
}
