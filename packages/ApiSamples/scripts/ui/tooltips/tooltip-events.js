let v = grok.shell.newView('list');

grok.dapi.users.list().then((users) => v.root.appendChild(ui.list(users)));

v.append(ui.h3("Let's hide the tooltip for users that have 'a' in the name!"))
grok.events.onTooltipRequest.subscribe((args) => {
    let context = args.args.context;
    if (context instanceof DG.User && context.name.includes('a'))
        args.preventDefault()
});

v.append(ui.h3("Also, we are going to modify the standard tooltip"))
grok.events.onTooltipShown.subscribe((args) => {
    let context = args.args.context;
    let element = args.args.element;
    if (context instanceof DG.User)
        element.appendChild(ui.h3(`Customized tooltip for ${context.name}`));
});

v.append(ui.h3("And show a balloon when tooltip is closed"));
grok.events.onTooltipClosed.subscribe((args) => grok.shell.info('Tooltip closed.'));
