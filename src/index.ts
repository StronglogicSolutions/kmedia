import { FormatLongPost, CreateImage, ReadFile } from './util'

async function post_generated_text(text : string) : Promise<boolean>
{
  const strings = FormatLongPost(text)
  const items   = []
  const caption = (text.length > 2200)  ? text.substring(0, 2200) : text
  const num     = (strings.length < 10) ? strings.length : 10

  for (let i = 0; i < num; i++)
    items.push({ file: await ReadFile(await CreateImage(strings[i], `page${i + 1}.jpg`)), width: 1080, height: 1080 })
  return (items.length > 0 && items[0])
}

async function run()
{
  if (process.argv.length < 3)
    throw new Error("You must pass text as a runtime parameter")

  const text = process.argv[2]

  await post_generated_text(text)

}

run()
