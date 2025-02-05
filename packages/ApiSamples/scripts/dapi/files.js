//tags: FileInfo
//help-url: https://datagrok.ai/help/develop/how-to/access-data
// JS API methods for working with files

(async () => {

  let res = null;

  // Write files
  await grok.dapi.files.write('Demo:TestJobs:Files:DemoFiles/testFile.dat', [0, 1, 2]);
  await grok.dapi.files.writeAsText('Demo:TestJobs:Files:DemoFiles/testFile.txt', 'testString');

  // Rename
  await grok.dapi.files.writeAsText('Demo:TestJobs:Files:DemoFiles/forRename.txt', 'testString');
  await grok.dapi.files.rename('Demo:TestJobs:Files:DemoFiles/forRename.txt', 'renamed.txt');

  // Read files
  res = await grok.dapi.files.readAsBytes('Demo:TestJobs:Files:DemoFiles/testFile.dat');
  console.log(`readAsBytes: ${res}`);
  res = await grok.dapi.files.readAsText('Demo:TestJobs:Files:DemoFiles/testFile.txt');
  console.log(`readAsText: ${res}`);
  res = await grok.dapi.files.exists('Demo:TestJobs:Files:DemoFiles/testFile.dat');
  console.log(`testFile.dat exists: ${res}`);

  // Search files
  let recursive = true;
  let searchPattern = 'world';
  res = await grok.dapi.files.list('Demo:TestJobs:Files:DemoFiles/geo', recursive, searchPattern);
  console.log(`list: ${res}`);

  // Move files
  await grok.dapi.files.move(['Demo:TestJobs:Files:DemoFiles/testFile.txt'], 'geo');
  res = await grok.dapi.files.exists('Demo:TestJobs:Files:DemoFiles/geo/testFile.txt');
  console.log(`testFile.txt was moved to geo: ${res}`);

  // Delete files
  await grok.dapi.files.delete('Demo:TestJobs:Files:DemoFiles/geo/testFile.txt');
  await grok.dapi.files.delete('Demo:TestJobs:Files:DemoFiles/testFile.dat');
})();
