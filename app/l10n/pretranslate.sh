crowdin push sources &&
crowdin push translations &&

CROWDIN_LANG=$(crowdin language list --plain)

LANG=""

for entry in $CROWDIN_LANG
do
  if [[ $entry =~ ^[a-z]{2}(-[A-Z]{2})?$ && $entry != en ]]
  then
    LANG+="-l $entry "
  fi
done

crowdin pre-translate $LANG--method mt --engine-id 489805 --file locales/en/messages.json &&
crowdin pull