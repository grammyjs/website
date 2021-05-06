function matchFilter1(filter) {
    if (Array.isArray(filter)) {
        const toPred = matchSingleFilter;
        const predicates = filter.map(toPred);
        return (ctx)=>predicates.some((pred)=>pred(ctx)
            )
        ;
    } else {
        const pred = matchSingleFilter(filter);
        return (ctx)=>pred(ctx)
        ;
    }
}
function matchSingleFilter(filter) {
    const [l1, l2, l3] = filter.split(':');
    if (l1 === undefined) throw new Error('Empty filter query given');
    if (!(l2 !== undefined && l1 === '' || l1 in UPDATE_KEYS)) {
        const permitted = Object.keys(UPDATE_KEYS);
        throw new Error(`Invalid L1 filter '${l1}' given in '${filter}'. Permitted values are: ${permitted.map((k)=>`'${k}'`
        ).join(', ')}`);
    }
    const l1Obj = l1 === '' ? (ctx)=>{
        const elem = L1_DEFAULTS.find((p)=>p in ctx.update
        );
        if (elem === undefined) return undefined;
        return ctx.update[elem];
    } : (ctx)=>ctx.update[l1]
    ;
    if (l2 === undefined) return (ctx)=>l1Obj(ctx) !== undefined
    ;
    const l1ValidationObjs = l1 === '' ? L1_DEFAULTS.reduce((agg, p)=>({
            ...agg,
            ...UPDATE_KEYS[p]
        })
    , {
    }) : UPDATE_KEYS[l1];
    if (!(l3 !== undefined && l2 === '' || l2 in l1ValidationObjs)) {
        const permitted = Object.keys(l1ValidationObjs);
        throw new Error(`Invalid L2 filter '${l2}' given in '${filter}'. Permitted values are: ${permitted.map((k)=>`'${k}'`
        ).join(', ')}`);
    }
    const l2Obj = l2 === '' ? (ctx)=>{
        const l1o = l1Obj(ctx);
        if (l1o === undefined) return undefined;
        const elem = L2_DEFAULTS.find((p)=>p in l1o
        );
        if (elem === undefined) return undefined;
        return l1o[elem];
    } : (ctx)=>{
        const l1o = l1Obj(ctx);
        return l1o === undefined ? undefined : l1o[l2];
    };
    if (l3 === undefined) return (ctx)=>l2Obj(ctx) !== undefined
    ;
    const l2ValidationObjs = l2 === '' ? L2_DEFAULTS.reduce((agg, p)=>({
            ...agg,
            ...l1ValidationObjs[p]
        })
    , {
    }) : l1ValidationObjs[l2];
    if (!(l3 in l2ValidationObjs)) {
        const permitted = Object.keys(l2ValidationObjs);
        if (permitted.length === 0) throw new Error(`Invalid L3 filter '${l3}' given in '${filter}'. No further filtering is possible after '${l1}:${l2}'.`);
        else throw new Error(`Invalid L3 filter '${l3}' given in '${filter}'. Permitted values are: ${permitted.map((k)=>`'${k}'`
        ).join(', ')}`);
    }
    return l3 === 'me' ? (ctx)=>{
        const me = ctx.me.id;
        return testMaybeArray(l2Obj(ctx), (u)=>u.id === me
        );
    } : (ctx)=>testMaybeArray(l2Obj(ctx), (e)=>e[l3] || e.type === l3
        )
    ;
}
function testMaybeArray(t, pred) {
    const p = (x)=>!!x && pred(x)
    ;
    return Array.isArray(t) ? t.some(p) : p(t);
}
const ENTITY_KEYS = {
    mention: {
    },
    hashtag: {
    },
    cashtag: {
    },
    bot_command: {
    },
    url: {
    },
    email: {
    },
    phone_number: {
    },
    bold: {
    },
    italic: {
    },
    underline: {
    },
    strikethrough: {
    },
    code: {
    }
};
const USER_KEYS = {
    me: {
    },
    is_bot: {
    }
};
const MESSAGE_KEYS = {
    text: {
    },
    animation: {
    },
    audio: {
    },
    document: {
    },
    photo: {
    },
    sticker: {
    },
    video: {
    },
    video_note: {
    },
    voice: {
    },
    contact: {
    },
    dice: {
    },
    game: {
    },
    poll: {
    },
    venue: {
    },
    location: {
    },
    new_chat_members: USER_KEYS,
    left_chat_member: USER_KEYS,
    new_chat_title: {
    },
    new_chat_photo: {
    },
    delete_chat_photo: {
    },
    group_chat_created: {
    },
    supergroup_chat_created: {
    },
    channel_chat_created: {
    },
    message_auto_delete_timer_changed: {
    },
    migrate_to_chat_id: {
    },
    migrate_from_chat_id: {
    },
    pinned_message: {
    },
    invoice: {
    },
    successful_payment: {
    },
    connected_website: {
    },
    passport_data: {
    },
    proximity_alert_triggered: {
    },
    voice_chat_scheduled: {
    },
    voice_chat_started: {
    },
    voice_chat_ended: {
    },
    voice_chat_participants_invited: {
    },
    entities: ENTITY_KEYS,
    caption_entities: ENTITY_KEYS,
    forward_date: {
    },
    caption: {
    }
};
const CALLBACK_QUERY_KEYS = {
    data: {
    },
    game_short_name: {
    }
};
const CHAT_MEMBER_UPDATED_KEYS = {
    chat: {
    },
    from: USER_KEYS,
    old_chat_member: {
    },
    new_chat_member: {
    }
};
const UPDATE_KEYS = {
    message: MESSAGE_KEYS,
    edited_message: MESSAGE_KEYS,
    channel_post: MESSAGE_KEYS,
    edited_channel_post: MESSAGE_KEYS,
    inline_query: {
    },
    chosen_inline_result: {
    },
    callback_query: CALLBACK_QUERY_KEYS,
    shipping_query: {
    },
    pre_checkout_query: {
    },
    poll: {
    },
    poll_answer: {
    },
    my_chat_member: CHAT_MEMBER_UPDATED_KEYS,
    chat_member: CHAT_MEMBER_UPDATED_KEYS
};
const L1_DEFAULTS = [
    'message',
    'channel_post'
];
const L2_DEFAULTS = [
    'entities',
    'caption_entities'
];
function flatten(mw) {
    return typeof mw === 'function' ? mw : (ctx, next)=>mw.middleware()(ctx, next)
    ;
}
function concat(first, andThen) {
    return async (ctx, next)=>{
        let nextCalled = false;
        await first(ctx, async ()=>{
            if (nextCalled) throw new Error('`next` already called before!');
            else nextCalled = true;
            await andThen(ctx, next);
        });
    };
}
function pass(_ctx, next) {
    return next();
}
const leaf = ()=>Promise.resolve()
;
async function run(middleware, ctx) {
    await middleware(ctx, leaf);
}
class Composer1 {
    handler;
    constructor(...middleware1){
        this.handler = middleware1.length === 0 ? pass : middleware1.map(flatten).reduce(concat);
    }
    middleware() {
        return this.handler;
    }
    use(...middleware) {
        const composer = new Composer1(...middleware);
        this.handler = concat(this.handler, flatten(composer));
        return composer;
    }
    on(filter, ...middleware) {
        return this.filter(matchFilter1(filter), ...middleware);
    }
    hears(trigger, ...middleware) {
        const trg = triggerFn(trigger);
        return this.on([
            ':text',
            ':caption'
        ]).filter((ctx)=>{
            const msg = ctx.message ?? ctx.channelPost;
            return match1(ctx, msg.text ?? msg.caption, trg);
        }, ...middleware);
    }
    command(command, ...middleware) {
        const atCommands = new Set();
        const noAtCommands = new Set();
        toArray(command).forEach((cmd)=>{
            if (cmd.startsWith('/')) {
                throw new Error(`Do not include '/' when registering command handlers (use '${cmd.substr(0, 1)}' not '${cmd}')`);
            }
            const set = cmd.indexOf('@') === -1 ? noAtCommands : atCommands;
            set.add(cmd);
        });
        return this.on(':entities:bot_command').filter((ctx)=>{
            const msg = ctx.message ?? ctx.channelPost;
            const txt = msg.text ?? msg.caption;
            const entities = msg.entities ?? msg.caption_entities;
            return entities.some((e)=>{
                if (e.type !== 'bot_command') return false;
                if (e.offset !== 0) return false;
                const cmd = txt.substring(1, e.length);
                if (noAtCommands.has(cmd) || atCommands.has(cmd)) {
                    ctx.match = txt.substr(cmd.length + 1);
                    return true;
                }
                const index = cmd.indexOf('@');
                if (index === -1) return false;
                if (noAtCommands.has(cmd.substring(0, index))) {
                    ctx.match = txt.substr(cmd.length + 1);
                    return true;
                }
                return false;
            });
        }, ...middleware);
    }
    callbackQuery(trigger, ...middleware) {
        const trg = triggerFn(trigger);
        return this.on('callback_query:data').filter((ctx)=>match1(ctx, ctx.callbackQuery.data, trg)
        , ...middleware);
    }
    gameQuery(trigger, ...middleware) {
        const trg = triggerFn(trigger);
        return this.on('callback_query:game_short_name').filter((ctx)=>match1(ctx, ctx.callbackQuery.game_short_name, trg)
        , ...middleware);
    }
    inlineQuery(trigger, ...middleware) {
        const trg = triggerFn(trigger);
        return this.on('inline_query').filter((ctx)=>match1(ctx, ctx.inlineQuery.query, trg)
        , ...middleware);
    }
    filter(predicate, ...middleware) {
        const composer = new Composer1(...middleware);
        this.branch(predicate, composer, pass);
        return composer;
    }
    drop(predicate, ...middleware) {
        return this.filter((ctx)=>!predicate(ctx)
        , ...middleware);
    }
    fork(...middleware) {
        const composer = new Composer1(...middleware);
        const fork = flatten(composer);
        this.use((ctx, next)=>Promise.all([
                next(),
                run(fork, ctx)
            ])
        );
        return composer;
    }
    lazy(middlewareFactory) {
        return this.use(async (ctx, next)=>{
            const middleware2 = await middlewareFactory(ctx);
            const arr = toArray(middleware2);
            await flatten(new Composer1(...arr))(ctx, next);
        });
    }
    route(router, routeHandlers, fallback = pass) {
        return this.lazy(async (ctx)=>{
            const route = await router(ctx);
            return route === undefined ? [] : routeHandlers[route] ?? fallback;
        });
    }
    branch(predicate, trueMiddleware, falseMiddleware) {
        return this.lazy((ctx)=>predicate(ctx) ? trueMiddleware : falseMiddleware
        );
    }
}
function triggerFn(trigger) {
    return toArray(trigger).map((t)=>typeof t === 'string' ? (txt)=>txt === t ? t : null
         : (txt)=>t.exec(txt)
    );
}
function match1(ctx, content, triggers) {
    for (const t of triggers){
        const res = t(content);
        if (res) {
            ctx.match = res;
            return true;
        }
    }
    return false;
}
function toArray(e) {
    return Array.isArray(e) ? e : [
        e
    ];
}
class Context1 {
    update;
    api;
    me;
    match;
    constructor(update1, api1, me){
        this.update = update1;
        this.api = api1;
        this.me = me;
    }
    get message() {
        return this.update.message;
    }
    get editedMessage() {
        return this.update.edited_message;
    }
    get channelPost() {
        return this.update.channel_post;
    }
    get editedChannelPost() {
        return this.update.edited_channel_post;
    }
    get inlineQuery() {
        return this.update.inline_query;
    }
    get chosenInlineResult() {
        return this.update.chosen_inline_result;
    }
    get callbackQuery() {
        return this.update.callback_query;
    }
    get shippingQuery() {
        return this.update.shipping_query;
    }
    get preCheckoutQuery() {
        return this.update.pre_checkout_query;
    }
    get poll() {
        return this.update.poll;
    }
    get pollAnswer() {
        return this.update.poll_answer;
    }
    get myChatMember() {
        return this.update.my_chat_member;
    }
    get chatMember() {
        return this.update.chat_member;
    }
    get msg() {
        return (((this.message ?? this.editedMessage) ?? this.callbackQuery?.message) ?? this.channelPost) ?? this.editedChannelPost;
    }
    get chat() {
        return this.msg?.chat;
    }
    get senderChat() {
        return this.msg?.sender_chat;
    }
    get from() {
        return (((((this.callbackQuery ?? this.inlineQuery) ?? this.shippingQuery) ?? this.preCheckoutQuery) ?? this.chosenInlineResult) ?? this.msg)?.from;
    }
    get inlineMessageId() {
        return this.callbackQuery?.inline_message_id ?? this.chosenInlineResult?.inline_message_id;
    }
    reply(text, other, signal) {
        return this.api.sendMessage(orThrow(this.chat, 'sendMessage').id, text, other, signal);
    }
    forwardMessage(chat_id, other, signal) {
        return this.api.forwardMessage(chat_id, orThrow(this.chat, 'forwardMessage').id, orThrow(this.msg, 'forwardMessage').message_id, other, signal);
    }
    copyMessage(chat_id, other, signal) {
        return this.api.copyMessage(chat_id, orThrow(this.chat, 'copyMessage').id, orThrow(this.msg, 'copyMessage').message_id, other, signal);
    }
    replyWithPhoto(photo, other, signal) {
        return this.api.sendPhoto(orThrow(this.chat, 'sendPhoto').id, photo, other, signal);
    }
    replyWithAudio(audio, other, signal) {
        return this.api.sendAudio(orThrow(this.chat, 'sendAudio').id, audio, other, signal);
    }
    replyWithDocument(document, other, signal) {
        return this.api.sendDocument(orThrow(this.chat, 'sendDocument').id, document, other, signal);
    }
    replyWithVideo(video, other, signal) {
        return this.api.sendVideo(orThrow(this.chat, 'sendVideo').id, video, other, signal);
    }
    replyWithAnimation(animation, other, signal) {
        return this.api.sendAnimation(orThrow(this.chat, 'sendAnimation').id, animation, other, signal);
    }
    replyWithVoice(voice, other, signal) {
        return this.api.sendVoice(orThrow(this.chat, 'sendVoice').id, voice, other, signal);
    }
    replyWithVideoNote(video_note, other, signal) {
        return this.api.sendVideoNote(orThrow(this.chat, 'sendVideoNote').id, video_note, other, signal);
    }
    replyWithMediaGroup(media, other, signal) {
        return this.api.sendMediaGroup(orThrow(this.chat, 'sendMediaGroup').id, media, other, signal);
    }
    replyWithLocation(latitude, longitude, other, signal) {
        return this.api.sendLocation(orThrow(this.chat, 'sendLocation').id, latitude, longitude, other, signal);
    }
    editMessageLiveLocation(latitude, longitude, other, signal) {
        const inlineId = (this.callbackQuery ?? this.chosenInlineResult)?.inline_message_id;
        return inlineId !== undefined ? this.api.editMessageLiveLocationInline(inlineId, latitude, longitude, other) : this.api.editMessageLiveLocation(orThrow(this.chat, 'editMessageLiveLocation').id, orThrow(this.msg, 'editMessageLiveLocation').message_id, latitude, longitude, other, signal);
    }
    stopMessageLiveLocation(other, signal) {
        const inlineId = (this.callbackQuery ?? this.chosenInlineResult)?.inline_message_id;
        return inlineId !== undefined ? this.api.stopMessageLiveLocationInline(inlineId, other) : this.api.stopMessageLiveLocation(orThrow(this.chat, 'stopMessageLiveLocation').id, orThrow(this.msg, 'stopMessageLiveLocation').message_id, other, signal);
    }
    replyWithVenue(latitude, longitude, title, address, other, signal) {
        return this.api.sendVenue(orThrow(this.chat, 'sendVenue').id, latitude, longitude, title, address, other, signal);
    }
    replyWithContact(phone_number, first_name, other, signal) {
        return this.api.sendContact(orThrow(this.chat, 'sendContact').id, phone_number, first_name, other, signal);
    }
    replyWithPoll(question, options, other, signal) {
        return this.api.sendPoll(orThrow(this.chat, 'sendPoll').id, question, options, other, signal);
    }
    replyWithDice(emoji, other, signal) {
        return this.api.sendDice(orThrow(this.chat, 'sendDice').id, emoji, other, signal);
    }
    replyWithChatAction(action, signal) {
        return this.api.sendChatAction(orThrow(this.chat, 'sendChatAction').id, action, signal);
    }
    getUserProfilePhotos(other, signal) {
        return this.api.getUserProfilePhotos(orThrow(this.from, 'getUserProfilePhotos').id, other, signal);
    }
    kickAuthor(other, signal) {
        return this.api.kickChatMember(orThrow(this.chat, 'kickChatMember').id, orThrow(this.from, 'kickChatMember').id, other, signal);
    }
    kickChatMember(user_id, other, signal) {
        return this.api.kickChatMember(orThrow(this.chat, 'kickChatMember').id, user_id, other, signal);
    }
    unbanChatMember(user_id, other, signal) {
        return this.api.unbanChatMember(orThrow(this.chat, 'unbanChatMember').id, user_id, other, signal);
    }
    restrictAuthor(permissions, other, signal) {
        return this.api.restrictChatMember(orThrow(this.chat, 'restrictChatMember').id, orThrow(this.from, 'restrictChatMember').id, permissions, other, signal);
    }
    restrictChatMember(user_id, permissions, other, signal) {
        return this.api.restrictChatMember(orThrow(this.chat, 'restrictChatMember').id, user_id, permissions, other, signal);
    }
    promoteAuthor(other, signal) {
        return this.api.promoteChatMember(orThrow(this.chat, 'promoteChatMember').id, orThrow(this.from, 'promoteChatMember').id, other, signal);
    }
    promoteChatMember(user_id, other, signal) {
        return this.api.promoteChatMember(orThrow(this.chat, 'promoteChatMember').id, user_id, other, signal);
    }
    setChatAdministratorAuthorCustomTitle(custom_title, signal) {
        return this.api.setChatAdministratorCustomTitle(orThrow(this.chat, 'setChatAdministratorCustomTitle').id, orThrow(this.from, 'setChatAdministratorCustomTitle').id, custom_title, signal);
    }
    setChatAdministratorCustomTitle(user_id, custom_title, signal) {
        return this.api.setChatAdministratorCustomTitle(orThrow(this.chat, 'setChatAdministratorCustomTitle').id, user_id, custom_title, signal);
    }
    setChatPermissions(permissions, signal) {
        return this.api.setChatPermissions(orThrow(this.chat, 'setChatPermissions').id, permissions, signal);
    }
    exportChatInviteLink(signal) {
        return this.api.exportChatInviteLink(orThrow(this.chat, 'exportChatInviteLink').id, signal);
    }
    createChatInviteLink(other, signal) {
        return this.api.createChatInviteLink(orThrow(this.chat, 'createChatInviteLink').id, other, signal);
    }
    editChatInviteLink(invite_link, other, signal) {
        return this.api.editChatInviteLink(orThrow(this.chat, 'editChatInviteLink').id, invite_link, other, signal);
    }
    revokeChatInviteLink(invite_link, signal) {
        return this.api.revokeChatInviteLink(orThrow(this.chat, 'editChatInviteLink').id, invite_link, signal);
    }
    setChatPhoto(photo, signal) {
        return this.api.setChatPhoto(orThrow(this.chat, 'setChatPhoto').id, photo, signal);
    }
    deleteChatPhoto(signal) {
        return this.api.deleteChatPhoto(orThrow(this.chat, 'deleteChatPhoto').id, signal);
    }
    setChatTitle(title, signal) {
        return this.api.setChatTitle(orThrow(this.chat, 'setChatTitle').id, title, signal);
    }
    setChatDescription(description, signal) {
        return this.api.setChatDescription(orThrow(this.chat, 'setChatDescription').id, description, signal);
    }
    pinChatMessage(message_id, other, signal) {
        return this.api.pinChatMessage(orThrow(this.chat, 'pinChatMessage').id, message_id, other, signal);
    }
    unpinChatMessage(message_id, signal) {
        return this.api.unpinChatMessage(orThrow(this.chat, 'unpinChatMessage').id, message_id, signal);
    }
    unpinAllChatMessages(signal) {
        return this.api.unpinAllChatMessages(orThrow(this.chat, 'unpinAllChatMessages').id, signal);
    }
    leaveChat(signal) {
        return this.api.leaveChat(orThrow(this.chat, 'leaveChat').id, signal);
    }
    getChat(signal) {
        return this.api.getChat(orThrow(this.chat, 'getChat').id, signal);
    }
    getChatAdministrators(signal) {
        return this.api.getChatAdministrators(orThrow(this.chat, 'getChatAdministrators').id, signal);
    }
    getChatMembersCount(signal) {
        return this.api.getChatMembersCount(orThrow(this.chat, 'getChatMembersCount').id, signal);
    }
    getAuthor(signal) {
        return this.api.getChatMember(orThrow(this.chat, 'getChatMember').id, orThrow(this.from, 'getChatMember').id, signal);
    }
    getChatMember(user_id, signal) {
        return this.api.getChatMember(orThrow(this.chat, 'getChatMember').id, user_id, signal);
    }
    setChatStickerSet(sticker_set_name, signal) {
        return this.api.setChatStickerSet(orThrow(this.chat, 'setChatStickerSet').id, sticker_set_name, signal);
    }
    deleteChatStickerSet(signal) {
        return this.api.deleteChatStickerSet(orThrow(this.chat, 'deleteChatStickerSet').id, signal);
    }
    answerCallbackQuery(other, signal) {
        return this.api.answerCallbackQuery(orThrow(this.callbackQuery, 'answerCallbackQuery').id, other, signal);
    }
    editMessageText(text, other, signal) {
        const inlineId = (this.callbackQuery ?? this.chosenInlineResult)?.inline_message_id;
        return inlineId !== undefined ? this.api.editMessageTextInline(inlineId, text, other) : this.api.editMessageText(orThrow(this.chat, 'editMessageText').id, orThrow(this.msg, 'editMessageText').message_id, text, other, signal);
    }
    editMessageCaption(other, signal) {
        const inlineId = (this.callbackQuery ?? this.chosenInlineResult)?.inline_message_id;
        return inlineId !== undefined ? this.api.editMessageCaptionInline(inlineId, other) : this.api.editMessageCaption(orThrow(this.chat, 'editMessageCaption').id, orThrow(this.msg, 'editMessageCaption').message_id, other, signal);
    }
    editMessageMedia(media, other, signal) {
        const inlineId = (this.callbackQuery ?? this.chosenInlineResult)?.inline_message_id;
        return inlineId !== undefined ? this.api.editMessageMediaInline(inlineId, media, other) : this.api.editMessageMedia(orThrow(this.chat, 'editMessageMedia').id, orThrow(this.msg, 'editMessageMedia').message_id, media, other, signal);
    }
    editMessageReplyMarkup(other, signal) {
        const inlineId = (this.callbackQuery ?? this.chosenInlineResult)?.inline_message_id;
        return inlineId !== undefined ? this.api.editMessageReplyMarkupInline(inlineId, other) : this.api.editMessageReplyMarkup(orThrow(this.chat, 'editMessageReplyMarkup').id, orThrow(this.msg, 'editMessageReplyMarkup').message_id, other, signal);
    }
    stopPoll(other, signal) {
        return this.api.stopPoll(orThrow(this.chat, 'stopPoll').id, orThrow(this.msg, 'stopPoll').message_id, other, signal);
    }
    deleteMessage(signal) {
        return this.api.deleteMessage(orThrow(this.chat, 'deleteMessage').id, orThrow(this.msg, 'deleteMessage').message_id, signal);
    }
    replyWithSticker(sticker, other, signal) {
        return this.api.sendSticker(orThrow(this.chat, 'sendSticker').id, sticker, other, signal);
    }
    answerInlineQuery(results, other, signal) {
        return this.api.answerInlineQuery(orThrow(this.inlineQuery, 'answerInlineQuery').id, results, other, signal);
    }
    replyWithInvoice(title, description, payload, provider_token, currency, prices, other, signal) {
        return this.api.sendInvoice(orThrow(this.chat, 'sendInvoice').id, title, description, payload, provider_token, currency, prices, other, signal);
    }
    answerShippingQuery(ok, other, signal) {
        return this.api.answerShippingQuery(orThrow(this.shippingQuery, 'answerShippingQuery').id, ok, other, signal);
    }
    answerPreCheckoutQuery(ok, other, signal) {
        return this.api.answerPreCheckoutQuery(orThrow(this.preCheckoutQuery, 'answerPreCheckoutQuery').id, ok, other, signal);
    }
    setPassportDataErrors(errors, signal) {
        return this.api.setPassportDataErrors(orThrow(this.from, 'setPassportDataErrors').id, errors, signal);
    }
    replyWithGame(game_short_name, other, signal) {
        return this.api.sendGame(orThrow(this.chat, 'sendGame').id, game_short_name, other, signal);
    }
}
function orThrow(value, method) {
    if (value === undefined) throw new Error(`Missing information for API call to ${method}`);
    return value;
}
const osType = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator1(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const sep = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path;
        if (i >= 0) {
            path = pathSegments[i];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute) tail = ".";
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return false;
    const code = path.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    } else if (isWindowsDeviceRoot(code)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (joined === undefined) joined = firstPart = path;
            else joined += `\\${path}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path) {
    if (typeof path !== "string") return path;
    if (path.length === 0) return "";
    const resolvedPath = resolve(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== 63 && code !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path;
}
function dirname(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return path;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path.slice(0, end);
}
function basename(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= start; --i){
            if (isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname(path) {
    assertPath(path);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path.length - 1; i >= start; --i){
        const code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse3(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        ret.root = ret.dir = path;
        return ret;
    }
    if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path.slice(startPart, end);
        }
    } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}
function toFileUrl(path) {
    if (!isAbsolute(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\][^/\\]))?(.*)/);
    const url = new URL("file:///");
    url.pathname = pathname.replace(/%/g, "%25");
    if (hostname != null) {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod = function() {
    return {
        sep: sep,
        delimiter: delimiter,
        resolve: resolve,
        normalize: normalize,
        isAbsolute: isAbsolute,
        join: join,
        relative: relative,
        toNamespacedPath: toNamespacedPath,
        dirname: dirname,
        basename: basename,
        extname: extname,
        format: format,
        parse: parse3,
        fromFileUrl: fromFileUrl,
        toFileUrl: toFileUrl
    };
}();
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno.cwd();
        }
        assertPath(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const isAbsolute1 = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString(path, !isAbsolute1, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute1) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute1) return `/${path}`;
    return path;
}
function isAbsolute1(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path) {
    return path;
}
function dirname1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path.length - 1; i >= 1; --i){
        if (path.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path.slice(0, end);
}
function basename1(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if ((--extIdx) === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= 0; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname1(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse1(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path.length === 0) return ret;
    const isAbsolute2 = path.charCodeAt(0) === 47;
    let start;
    if (isAbsolute2) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute2) {
                ret.base = ret.name = path.slice(1, end);
            } else {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute2) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute2) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path) {
    if (!isAbsolute1(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = path.replace(/%/g, "%25").replace(/\\/g, "%5C");
    return url;
}
const mod1 = function() {
    return {
        sep: sep1,
        delimiter: delimiter1,
        resolve: resolve1,
        normalize: normalize1,
        isAbsolute: isAbsolute1,
        join: join1,
        relative: relative1,
        toNamespacedPath: toNamespacedPath1,
        dirname: dirname1,
        basename: basename1,
        extname: extname1,
        format: format1,
        parse: parse1,
        fromFileUrl: fromFileUrl1,
        toFileUrl: toFileUrl1
    };
}();
const path = isWindows ? mod : mod1;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join2 , normalize: normalize2 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path;
var s = 1000;
var m1 = s * 60;
var h = m1 * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
var ms = function(val, options) {
    options = options || {
    };
    var type = typeof val;
    if (type === "string" && val.length > 0) {
        return parse4(val);
    } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
};
function parse4(str) {
    str = String(str);
    if (str.length > 100) {
        return;
    }
    var match2 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match2) {
        return;
    }
    var n = parseFloat(match2[1]);
    var type = (match2[2] || "ms").toLowerCase();
    switch(type){
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
            return n * y;
        case "weeks":
        case "week":
        case "w":
            return n * w;
        case "days":
        case "day":
        case "d":
            return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
            return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
            return n * m1;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
            return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
            return n;
        default:
            return void 0;
    }
}
function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
        return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
        return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m1) {
        return Math.round(ms2 / m1) + "m";
    }
    if (msAbs >= s) {
        return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
}
function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
        return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
        return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m1) {
        return plural(ms2, msAbs, m1, "minute");
    }
    if (msAbs >= s) {
        return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
}
function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
}
function defaultSetTimout() {
    throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
    throw new Error("clearTimeout has not been defined");
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== "undefined") {
    globalContext = window;
} else if (typeof self !== "undefined") {
    globalContext = self;
} else {
    globalContext = {
    };
}
if (typeof globalContext.setTimeout === "function") {
    cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === "function") {
    cachedClearTimeout = clearTimeout;
}
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e2) {
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        return cachedClearTimeout(marker);
    } catch (e) {
        try {
            return cachedClearTimeout.call(null, marker);
        } catch (e2) {
            return cachedClearTimeout.call(this, marker);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}
function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while(len){
        currentQueue = queue;
        queue = [];
        while((++queueIndex) < len){
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for(var i = 1; i < arguments.length; i++){
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function() {
    this.fun.apply(null, this.array);
};
var title1 = "browser";
var platform = "browser";
var browser = true;
var argv = [];
var version = "";
var versions = {
};
var release = {
};
var config1 = {
};
function noop() {
}
var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
    throw new Error("process.binding is not supported");
}
function cwd() {
    return "/";
}
function chdir(dir) {
    throw new Error("process.chdir is not supported");
}
function umask() {
    return 0;
}
var performance = globalContext.performance || {
};
var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
    return new Date().getTime();
};
function hrtime(previousTimestamp) {
    var clocktime = performanceNow.call(performance) * 0.001;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1000000000);
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1000000000;
        }
    }
    return [
        seconds,
        nanoseconds
    ];
}
var startTime = new Date();
function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
}
var process = {
    nextTick,
    title: title1,
    browser,
    env: {
        NODE_ENV: "production"
    },
    argv,
    version,
    versions,
    on,
    addListener,
    once,
    off,
    removeListener,
    removeAllListeners,
    emit,
    binding,
    cwd,
    chdir,
    umask,
    hrtime,
    platform,
    release,
    config: config1,
    uptime
};
function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path1, base) {
            return commonjsRequire(path1, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = ms;
    createDebug.destroy = destroy2;
    Object.keys(env).forEach((key)=>{
        createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {
    };
    function selectColor(namespace) {
        let hash = 0;
        for(let i = 0; i < namespace.length; i++){
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        function debug(...args) {
            if (!debug.enabled) {
                return;
            }
            const self2 = debug;
            const curr = Number(new Date());
            const ms2 = curr - (prevTime || curr);
            self2.diff = ms2;
            self2.prev = prevTime;
            self2.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== "string") {
                args.unshift("%O");
            }
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match2, format3)=>{
                if (match2 === "%%") {
                    return "%";
                }
                index++;
                const formatter = createDebug.formatters[format3];
                if (typeof formatter === "function") {
                    const val = args[index];
                    match2 = formatter.call(self2, val);
                    args.splice(index, 1);
                    index--;
                }
                return match2;
            });
            createDebug.formatArgs.call(self2, args);
            const logFn = self2.log || createDebug.log;
            logFn.apply(self2, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
            enumerable: true,
            configurable: false,
            get: ()=>enableOverride === null ? createDebug.enabled(namespace) : enableOverride
            ,
            set: (v)=>{
                enableOverride = v;
            }
        });
        if (typeof createDebug.init === "function") {
            createDebug.init(debug);
        }
        return debug;
    }
    function extend(namespace, delimiter3) {
        const newDebug = createDebug(this.namespace + (typeof delimiter3 === "undefined" ? ":" : delimiter3) + namespace);
        newDebug.log = this.log;
        return newDebug;
    }
    function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for(i = 0; i < len; i++){
            if (!split[i]) {
                continue;
            }
            namespaces = split[i].replace(/\*/g, ".*?");
            if (namespaces[0] === "-") {
                createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
            } else {
                createDebug.names.push(new RegExp("^" + namespaces + "$"));
            }
        }
    }
    function disable() {
        const namespaces = [
            ...createDebug.names.map(toNamespace),
            ...createDebug.skips.map(toNamespace).map((namespace)=>"-" + namespace
            )
        ].join(",");
        createDebug.enable("");
        return namespaces;
    }
    function enabled(name) {
        if (name[name.length - 1] === "*") {
            return true;
        }
        let i;
        let len;
        for(i = 0, len = createDebug.skips.length; i < len; i++){
            if (createDebug.skips[i].test(name)) {
                return false;
            }
        }
        for(i = 0, len = createDebug.names.length; i < len; i++){
            if (createDebug.names[i].test(name)) {
                return true;
            }
        }
        return false;
    }
    function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    function destroy2() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
}
var common = setup;
var browser$1 = createCommonjsModule(function(module, exports) {
    exports.formatArgs = formatArgs2;
    exports.save = save2;
    exports.load = load2;
    exports.useColors = useColors2;
    exports.storage = localstorage();
    exports.destroy = (()=>{
        let warned = false;
        return ()=>{
            if (!warned) {
                warned = true;
                console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
            }
        };
    })();
    exports.colors = [
        "#0000CC",
        "#0000FF",
        "#0033CC",
        "#0033FF",
        "#0066CC",
        "#0066FF",
        "#0099CC",
        "#0099FF",
        "#00CC00",
        "#00CC33",
        "#00CC66",
        "#00CC99",
        "#00CCCC",
        "#00CCFF",
        "#3300CC",
        "#3300FF",
        "#3333CC",
        "#3333FF",
        "#3366CC",
        "#3366FF",
        "#3399CC",
        "#3399FF",
        "#33CC00",
        "#33CC33",
        "#33CC66",
        "#33CC99",
        "#33CCCC",
        "#33CCFF",
        "#6600CC",
        "#6600FF",
        "#6633CC",
        "#6633FF",
        "#66CC00",
        "#66CC33",
        "#9900CC",
        "#9900FF",
        "#9933CC",
        "#9933FF",
        "#99CC00",
        "#99CC33",
        "#CC0000",
        "#CC0033",
        "#CC0066",
        "#CC0099",
        "#CC00CC",
        "#CC00FF",
        "#CC3300",
        "#CC3333",
        "#CC3366",
        "#CC3399",
        "#CC33CC",
        "#CC33FF",
        "#CC6600",
        "#CC6633",
        "#CC9900",
        "#CC9933",
        "#CCCC00",
        "#CCCC33",
        "#FF0000",
        "#FF0033",
        "#FF0066",
        "#FF0099",
        "#FF00CC",
        "#FF00FF",
        "#FF3300",
        "#FF3333",
        "#FF3366",
        "#FF3399",
        "#FF33CC",
        "#FF33FF",
        "#FF6600",
        "#FF6633",
        "#FF9900",
        "#FF9933",
        "#FFCC00",
        "#FFCC33"
    ];
    function useColors2() {
        if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
            return true;
        }
        if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
            return false;
        }
        return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs2(args) {
        args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
        if (!this.useColors) {
            return;
        }
        const c = "color: " + this.color;
        args.splice(1, 0, c, "color: inherit");
        let index = 0;
        let lastC = 0;
        args[0].replace(/%[a-zA-Z%]/g, (match2)=>{
            if (match2 === "%%") {
                return;
            }
            index++;
            if (match2 === "%c") {
                lastC = index;
            }
        });
        args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (()=>{
    });
    function save2(namespaces) {
        try {
            if (namespaces) {
                exports.storage.setItem("debug", namespaces);
            } else {
                exports.storage.removeItem("debug");
            }
        } catch (error) {
        }
    }
    function load2() {
        let r;
        try {
            r = exports.storage.getItem("debug");
        } catch (error) {
        }
        if (!r && typeof process !== "undefined" && "env" in process) {
            r = process.env.DEBUG;
        }
        return r;
    }
    function localstorage() {
        try {
            return localStorage;
        } catch (error) {
        }
    }
    module.exports = common(exports);
    const { formatters  } = module.exports;
    formatters.j = function(v) {
        try {
            return JSON.stringify(v);
        } catch (error) {
            return "[UnexpectedJSONParseError]: " + error.message;
        }
    };
});
function readableStreamFromAsyncIterator(iterator) {
    return new ReadableStream({
        async pull (controller) {
            const { value , done  } = await iterator.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        }
    });
}
const isDeno = typeof Deno !== 'undefined';
if (isDeno) {
    browser$1.useColors = ()=>!Deno.noColor
    ;
    const env = {
        name: 'env',
        variable: 'DEBUG'
    };
    let res = await Deno.permissions.query(env);
    if (res.state === 'prompt') res = await Deno.permissions.request(env);
    if (res.state === 'granted') {
        const val = Deno.env.get(env.variable);
        if (val) browser$1.enable(val);
    }
}
const streamFile = isDeno ? (path1)=>Deno.open(path1).then(Deno.iter)
 : ()=>{
    throw new Error('Reading files by path requires a Deno environment');
};
const baseFetchConfig = {
};
class InputFile1 {
    file;
    filename;
    constructor(file, filename){
        this.file = file;
        if (filename === undefined && typeof file === 'string') filename = basename2(file);
        this.filename = filename;
    }
}
class GrammyError1 extends Error {
    payload;
    error_code;
    description;
    constructor(message1, info, payload1){
        super(`${message1} (${info.error_code}: ${info.description})`);
        this.payload = payload1;
        this.error_code = info.error_code;
        this.description = info.description;
    }
}
const debug = browser$1('grammy:warn');
function transformPayload(method, payload1) {
    const entries = Object.entries(payload1).map((kv)=>{
        const [key, value] = kv;
        if (mustSerialize(method, key)) {
            kv = [
                key,
                JSON.stringify(value)
            ];
        }
        return kv;
    });
    return Object.fromEntries(entries);
}
function requiresFormDataUpload(payload1) {
    return typeof payload1 === 'object' && payload1 !== null && Object.values(payload1).some((v)=>Array.isArray(v) ? v.some(requiresFormDataUpload) : v instanceof InputFile1 || requiresFormDataUpload(v)
    );
}
function createJsonPayload(payload1) {
    return {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            connection: 'keep-alive'
        },
        body: JSON.stringify(payload1, (_, v)=>v ?? undefined
        )
    };
}
function createFormDataPayload(payload1) {
    const boundary = createBoundary();
    return {
        method: 'POST',
        headers: {
            'content-type': `multipart/form-data; boundary=${boundary}`,
            connection: 'keep-alive'
        },
        body: readableStreamFromAsyncIterator(payloadToMultipartItr(payload1, boundary))
    };
}
function createBoundary() {
    return '----------' + randomId(32);
}
function randomId(length = 16) {
    return Array.from(Array(length)).map(()=>Math.random().toString(36)[2] || 0
    ).join('');
}
const enc = new TextEncoder();
async function* payloadToMultipartItr(payload1, boundary = createBoundary()) {
    yield enc.encode(`--${boundary}\r\n`);
    const separator = enc.encode(`\r\n--${boundary}\r\n`);
    let first = true;
    for (const [key, value] of Object.entries(payload1)){
        if (!first) yield separator;
        if (value instanceof InputFile1) {
            if (mustAttachIndirectly(key)) {
                const id = randomId();
                yield* filePart(id, key, value);
                yield valuePart(key, `attach://${id}`);
            } else {
                yield* filePart(key, key, value);
            }
        } else if (isInputMedia(value)) {
            if (value.media instanceof InputFile1) {
                const id = randomId();
                yield* filePart(id, key, value.media);
                value.media = `attach://${id}`;
            }
            yield valuePart(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
            for (const elem of value){
                if (isInputMedia(elem) && elem.media instanceof InputFile1) {
                    const id = randomId();
                    yield* filePart(id, key, elem.media);
                    yield separator;
                    elem.media = `attach://${id}`;
                }
            }
            yield valuePart(key, JSON.stringify(value));
        } else {
            yield valuePart(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
        first = false;
    }
    yield enc.encode(`\r\n--${boundary}--`);
}
function valuePart(key, value) {
    return enc.encode(`content-disposition:form-data;name="${key}"\r\n\r\n${value}`);
}
async function* filePart(id, key, input) {
    const filename1 = input.filename ?? `${key}.${getExt(key)}`;
    if (filename1.includes(';') || filename1.includes('"')) {
        debug('WARNING: Telegram Bot API currently does not support');
        debug('sending filenames that contain semicolons or double quotes');
        debug('(or both), confer https://github.com/tdlib/td/issues/1459.');
        debug('While grammY will send the correct data, the Telegram');
        debug('Bot API will discard everything after the first semicolon,');
        debug('and it will convert the double quotes into spaces.');
    }
    yield enc.encode(`content-disposition:form-data;name="${id}";filename=${filename1}\r\n\r\n`);
    if (input.file instanceof Uint8Array) {
        yield input.file;
    } else {
        const stream = typeof input.file === 'string' ? await streamFile(input.file) : input.file;
        yield* stream;
    }
}
function getExt(key) {
    switch(key){
        case 'photo':
            return 'jpg';
        case 'voice':
            return 'ogg';
        case 'audio':
            return 'mp3';
        case 'animation':
        case 'video':
        case 'video_note':
            return 'mp4';
        case 'sticker':
            return 'webp';
        default:
            return 'dat';
    }
}
const serializationFields = new Set([
    'allowed_updates',
    'reply_markup',
    'options',
    'commands',
    'mask_position',
    'results',
    'prices',
    'shipping_options',
    'errors', 
]);
const serializationMethodFields = new Set([
    'restrictChatMember:permissions'
]);
function mustSerialize(method, key) {
    return serializationFields.has(key) || serializationMethodFields.has(`${method}:${key}`);
}
const indirectAttachmentFields = new Set([
    'thumb'
]);
function mustAttachIndirectly(key) {
    return indirectAttachmentFields.has(key);
}
function has(obj, props) {
    return typeof obj === 'object' && obj !== null && props.every((p)=>p in obj
    );
}
const inputMediaProps = [
    'type',
    'media'
];
function isInputMedia(value) {
    return has(value, inputMediaProps) && typeof value.type === 'string' && (typeof value.media === 'string' || value.media instanceof InputFile1);
}
const debug1 = browser$1('grammy:core');
const concatTransformer = (prev, trans)=>(method, payload1, signal)=>trans(prev, method, payload1, signal)
;
const DEFAULT_OPTIONS = {
    apiRoot: 'https://api.telegram.org',
    buildUrl: (root, token, method)=>`${root}/bot${token}/${method}`
    ,
    baseFetchConfig,
    canUseWebhookReply: ()=>false
};
class ApiClient {
    token;
    webhookReplyEnvelope;
    options;
    hasUsedWebhookReply = false;
    installedTransformers = [];
    constructor(token2, options1, webhookReplyEnvelope2 = {
    }){
        this.token = token2;
        this.webhookReplyEnvelope = webhookReplyEnvelope2;
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options1
        };
    }
    call = async (method, payload1, signal)=>{
        debug1('Calling', method);
        const url = this.options.buildUrl(this.options.apiRoot, this.token, method);
        const transformed = transformPayload(method, payload1 ?? {
        });
        const config1 = requiresFormDataUpload(transformed) ? createFormDataPayload(transformed) : createJsonPayload(transformed);
        if (this.webhookReplyEnvelope.send !== undefined && !this.hasUsedWebhookReply && typeof config1.body === 'string' && this.options.canUseWebhookReply(method)) {
            this.hasUsedWebhookReply = true;
            await this.webhookReplyEnvelope.send(config1.body);
            return {
                ok: true,
                result: true
            };
        } else {
            const res = await fetch(url, {
                ...this.options.baseFetchConfig,
                signal,
                ...config1
            });
            return await res.json();
        }
    };
    use(...transformers) {
        this.call = transformers.reduce(concatTransformer, this.call);
        this.installedTransformers.push(...transformers);
        return this;
    }
    async callApi(method, payload, signal) {
        const data = await this.call(method, payload, signal);
        if (data.ok) return data.result;
        else throw new GrammyError1(`Call to ${method} failed!`, data, payload);
    }
}
function createRawApi(token1, options1, webhookReplyEnvelope1) {
    const client = new ApiClient(token1, options1, webhookReplyEnvelope1);
    const proxyHandler = {
        get (_, m) {
            return client.callApi.bind(client, m);
        },
        ...proxyMethods
    };
    const raw = new Proxy({
    }, proxyHandler);
    const installedTransformers = client.installedTransformers;
    const api1 = {
        raw,
        installedTransformers,
        use: (...t)=>{
            client.use(...t);
            return api1;
        }
    };
    return api1;
}
const proxyMethods = {
    set () {
        return false;
    },
    defineProperty () {
        return false;
    },
    deleteProperty () {
        return false;
    },
    ownKeys () {
        return [];
    }
};
class Api1 {
    raw;
    config;
    constructor(token1, config2, webhookReplyEnvelope1){
        const { raw , use , installedTransformers  } = createRawApi(token1, config2, webhookReplyEnvelope1);
        this.raw = raw;
        this.config = {
            use,
            installedTransformers: ()=>[
                    ...installedTransformers
                ]
        };
    }
    getUpdates(other, signal) {
        return this.raw.getUpdates({
            ...other
        }, signal);
    }
    setWebhook(url, other, signal) {
        return this.raw.setWebhook({
            url,
            ...other
        }, signal);
    }
    deleteWebhook(other, signal) {
        return this.raw.deleteWebhook({
            ...other
        }, signal);
    }
    getWebhookInfo(signal) {
        return this.raw.getWebhookInfo(signal);
    }
    getMe(signal) {
        return this.raw.getMe(signal);
    }
    logOut(signal) {
        return this.raw.logOut(signal);
    }
    close(signal) {
        return this.raw.close(signal);
    }
    sendMessage(chat_id, text, other, signal) {
        return this.raw.sendMessage({
            chat_id,
            text,
            ...other
        }, signal);
    }
    forwardMessage(chat_id, from_chat_id, message_id, other, signal) {
        return this.raw.forwardMessage({
            chat_id,
            from_chat_id,
            message_id,
            ...other
        }, signal);
    }
    copyMessage(chat_id, from_chat_id, message_id, other, signal) {
        return this.raw.copyMessage({
            chat_id,
            from_chat_id,
            message_id,
            ...other
        }, signal);
    }
    sendPhoto(chat_id, photo, other, signal) {
        return this.raw.sendPhoto({
            chat_id,
            photo,
            ...other
        }, signal);
    }
    sendAudio(chat_id, audio, other, signal) {
        return this.raw.sendAudio({
            chat_id,
            audio,
            ...other
        }, signal);
    }
    sendDocument(chat_id, document, other, signal) {
        return this.raw.sendDocument({
            chat_id,
            document,
            ...other
        }, signal);
    }
    sendVideo(chat_id, video, other, signal) {
        return this.raw.sendVideo({
            chat_id,
            video,
            ...other
        }, signal);
    }
    sendAnimation(chat_id, animation, other, signal) {
        return this.raw.sendAnimation({
            chat_id,
            animation,
            ...other
        }, signal);
    }
    sendVoice(chat_id, voice, other, signal) {
        return this.raw.sendVoice({
            chat_id,
            voice,
            ...other
        }, signal);
    }
    sendVideoNote(chat_id, video_note, other, signal) {
        return this.raw.sendVideoNote({
            chat_id,
            video_note,
            ...other
        }, signal);
    }
    sendMediaGroup(chat_id, media, other, signal) {
        return this.raw.sendMediaGroup({
            chat_id,
            media,
            ...other
        }, signal);
    }
    sendLocation(chat_id, latitude, longitude, other, signal) {
        return this.raw.sendLocation({
            chat_id,
            latitude,
            longitude,
            ...other
        }, signal);
    }
    editMessageLiveLocation(chat_id, message_id, latitude, longitude, other, signal) {
        return this.raw.editMessageLiveLocation({
            chat_id,
            message_id,
            latitude,
            longitude,
            ...other
        }, signal);
    }
    editMessageLiveLocationInline(inline_message_id, latitude, longitude, other, signal) {
        return this.raw.editMessageLiveLocation({
            inline_message_id,
            latitude,
            longitude,
            ...other
        }, signal);
    }
    stopMessageLiveLocation(chat_id, message_id, other, signal) {
        return this.raw.stopMessageLiveLocation({
            chat_id,
            message_id,
            ...other
        }, signal);
    }
    stopMessageLiveLocationInline(inline_message_id, other, signal) {
        return this.raw.stopMessageLiveLocation({
            inline_message_id,
            ...other
        }, signal);
    }
    sendVenue(chat_id, latitude, longitude, title, address, other, signal) {
        return this.raw.sendVenue({
            chat_id,
            latitude,
            longitude,
            title,
            address,
            ...other
        }, signal);
    }
    sendContact(chat_id, phone_number, first_name, other, signal) {
        return this.raw.sendContact({
            chat_id,
            phone_number,
            first_name,
            ...other
        }, signal);
    }
    sendPoll(chat_id, question, options, other, signal) {
        return this.raw.sendPoll({
            chat_id,
            question,
            options,
            ...other
        }, signal);
    }
    sendDice(chat_id, emoji, other, signal) {
        return this.raw.sendDice({
            chat_id,
            emoji,
            ...other
        }, signal);
    }
    sendChatAction(chat_id, action, signal) {
        return this.raw.sendChatAction({
            chat_id,
            action
        }, signal);
    }
    getUserProfilePhotos(user_id, other, signal) {
        return this.raw.getUserProfilePhotos({
            user_id,
            ...other
        }, signal);
    }
    getFile(file_id, signal) {
        return this.raw.getFile({
            file_id
        }, signal);
    }
    kickChatMember(chat_id, user_id, other, signal) {
        return this.raw.kickChatMember({
            chat_id,
            user_id,
            ...other
        }, signal);
    }
    unbanChatMember(chat_id, user_id, other, signal) {
        return this.raw.unbanChatMember({
            chat_id,
            user_id,
            ...other
        }, signal);
    }
    restrictChatMember(chat_id, user_id, permissions, other, signal) {
        return this.raw.restrictChatMember({
            chat_id,
            user_id,
            permissions,
            ...other
        }, signal);
    }
    promoteChatMember(chat_id, user_id, other, signal) {
        return this.raw.promoteChatMember({
            chat_id,
            user_id,
            ...other
        }, signal);
    }
    setChatAdministratorCustomTitle(chat_id, user_id, custom_title, signal) {
        return this.raw.setChatAdministratorCustomTitle({
            chat_id,
            user_id,
            custom_title
        }, signal);
    }
    setChatPermissions(chat_id, permissions, signal) {
        return this.raw.setChatPermissions({
            chat_id,
            permissions
        }, signal);
    }
    exportChatInviteLink(chat_id, signal) {
        return this.raw.exportChatInviteLink({
            chat_id
        }, signal);
    }
    createChatInviteLink(chat_id, other, signal) {
        return this.raw.createChatInviteLink({
            chat_id,
            ...other
        }, signal);
    }
    editChatInviteLink(chat_id, invite_link, other, signal) {
        return this.raw.editChatInviteLink({
            chat_id,
            invite_link,
            ...other
        }, signal);
    }
    revokeChatInviteLink(chat_id, invite_link, signal) {
        return this.raw.revokeChatInviteLink({
            chat_id,
            invite_link
        }, signal);
    }
    setChatPhoto(chat_id, photo, signal) {
        return this.raw.setChatPhoto({
            chat_id,
            photo
        }, signal);
    }
    deleteChatPhoto(chat_id, signal) {
        return this.raw.deleteChatPhoto({
            chat_id
        }, signal);
    }
    setChatTitle(chat_id, title, signal) {
        return this.raw.setChatTitle({
            chat_id,
            title
        }, signal);
    }
    setChatDescription(chat_id, description, signal) {
        return this.raw.setChatDescription({
            chat_id,
            description
        }, signal);
    }
    pinChatMessage(chat_id, message_id, other, signal) {
        return this.raw.pinChatMessage({
            chat_id,
            message_id,
            ...other
        }, signal);
    }
    unpinChatMessage(chat_id, message_id, signal) {
        return this.raw.unpinChatMessage({
            chat_id,
            message_id
        }, signal);
    }
    unpinAllChatMessages(chat_id, signal) {
        return this.raw.unpinAllChatMessages({
            chat_id
        }, signal);
    }
    leaveChat(chat_id, signal) {
        return this.raw.leaveChat({
            chat_id
        }, signal);
    }
    getChat(chat_id, signal) {
        return this.raw.getChat({
            chat_id
        }, signal);
    }
    getChatAdministrators(chat_id, signal) {
        return this.raw.getChatAdministrators({
            chat_id
        }, signal);
    }
    getChatMembersCount(chat_id, signal) {
        return this.raw.getChatMembersCount({
            chat_id
        }, signal);
    }
    getChatMember(chat_id, user_id, signal) {
        return this.raw.getChatMember({
            chat_id,
            user_id
        }, signal);
    }
    setChatStickerSet(chat_id, sticker_set_name, signal) {
        return this.raw.setChatStickerSet({
            chat_id,
            sticker_set_name
        }, signal);
    }
    deleteChatStickerSet(chat_id, signal) {
        return this.raw.deleteChatStickerSet({
            chat_id
        }, signal);
    }
    answerCallbackQuery(callback_query_id, other, signal) {
        return this.raw.answerCallbackQuery({
            callback_query_id,
            ...other
        }, signal);
    }
    setMyCommands(commands, signal) {
        return this.raw.setMyCommands({
            commands
        }, signal);
    }
    getMyCommands(signal) {
        return this.raw.getMyCommands(signal);
    }
    editMessageText(chat_id, message_id, text, other, signal) {
        return this.raw.editMessageText({
            chat_id,
            message_id,
            text,
            ...other
        }, signal);
    }
    editMessageTextInline(inline_message_id, text, other, signal) {
        return this.raw.editMessageText({
            inline_message_id,
            text,
            ...other
        }, signal);
    }
    editMessageCaption(chat_id, message_id, other, signal) {
        return this.raw.editMessageCaption({
            chat_id,
            message_id,
            ...other
        }, signal);
    }
    editMessageCaptionInline(inline_message_id, other, signal) {
        return this.raw.editMessageCaption({
            inline_message_id,
            ...other
        }, signal);
    }
    editMessageMedia(chat_id, message_id, media, other, signal) {
        return this.raw.editMessageMedia({
            chat_id,
            message_id,
            media,
            ...other
        }, signal);
    }
    editMessageMediaInline(inline_message_id, media, other, signal) {
        return this.raw.editMessageMedia({
            inline_message_id,
            media,
            ...other
        }, signal);
    }
    editMessageReplyMarkup(chat_id, message_id, other, signal) {
        return this.raw.editMessageReplyMarkup({
            chat_id,
            message_id,
            ...other
        }, signal);
    }
    editMessageReplyMarkupInline(inline_message_id, other, signal) {
        return this.raw.editMessageReplyMarkup({
            inline_message_id,
            ...other
        }, signal);
    }
    stopPoll(chat_id, message_id, other, signal) {
        return this.raw.stopPoll({
            chat_id,
            message_id,
            ...other
        }, signal);
    }
    deleteMessage(chat_id, message_id, signal) {
        return this.raw.deleteMessage({
            chat_id,
            message_id
        }, signal);
    }
    sendSticker(chat_id, sticker, other, signal) {
        return this.raw.sendSticker({
            chat_id,
            sticker,
            ...other
        }, signal);
    }
    getStickerSet(name, signal) {
        return this.raw.getStickerSet({
            name
        }, signal);
    }
    uploadStickerFile(user_id, png_sticker, signal) {
        return this.raw.uploadStickerFile({
            user_id,
            png_sticker
        }, signal);
    }
    createNewStickerSet(user_id, name, title, emojis, other, signal) {
        return this.raw.createNewStickerSet({
            user_id,
            name,
            title,
            emojis,
            ...other
        }, signal);
    }
    addStickerToSet(user_id, name, emojis, other, signal) {
        return this.raw.addStickerToSet({
            user_id,
            name,
            emojis,
            ...other
        }, signal);
    }
    setStickerPositionInSet(sticker, position, signal) {
        return this.raw.setStickerPositionInSet({
            sticker,
            position
        }, signal);
    }
    deleteStickerFromSet(sticker, signal) {
        return this.raw.deleteStickerFromSet({
            sticker
        }, signal);
    }
    setStickerSetThumb(name, user_id, thumb, signal) {
        return this.raw.setStickerSetThumb({
            name,
            user_id,
            thumb
        }, signal);
    }
    answerInlineQuery(inline_query_id, results, other, signal) {
        return this.raw.answerInlineQuery({
            inline_query_id,
            results,
            ...other
        }, signal);
    }
    sendInvoice(chat_id, title, description, payload, provider_token, currency, prices, other, signal) {
        return this.raw.sendInvoice({
            chat_id,
            title,
            description,
            payload,
            provider_token,
            currency,
            prices,
            ...other
        }, signal);
    }
    answerShippingQuery(shipping_query_id, ok, other, signal) {
        return this.raw.answerShippingQuery({
            shipping_query_id,
            ok,
            ...other
        }, signal);
    }
    answerPreCheckoutQuery(pre_checkout_query_id, ok, other, signal) {
        return this.raw.answerPreCheckoutQuery({
            pre_checkout_query_id,
            ok,
            ...other
        }, signal);
    }
    setPassportDataErrors(user_id, errors, signal) {
        return this.raw.setPassportDataErrors({
            user_id,
            errors
        }, signal);
    }
    sendGame(chat_id, game_short_name, other, signal) {
        return this.raw.sendGame({
            chat_id,
            game_short_name,
            ...other
        }, signal);
    }
    setGameScore(chat_id, message_id, user_id, score, other, signal) {
        return this.raw.setGameScore({
            chat_id,
            message_id,
            user_id,
            score,
            ...other
        }, signal);
    }
    setGameScoreInline(inline_message_id, user_id, score, other, signal) {
        return this.raw.setGameScore({
            inline_message_id,
            user_id,
            score,
            ...other
        }, signal);
    }
    getGameHighScores(chat_id, message_id, user_id, signal) {
        return this.raw.getGameHighScores({
            chat_id,
            message_id,
            user_id
        }, signal);
    }
    getGameHighScoresInline(inline_message_id, user_id, signal) {
        return this.raw.getGameHighScores({
            inline_message_id,
            user_id
        }, signal);
    }
}
const debug2 = browser$1('grammy:bot');
const debugErr = browser$1('grammy:error');
class BotError1 extends Error {
    error;
    ctx;
    constructor(error, ctx){
        super('Error in middleware!');
        this.error = error;
        this.ctx = ctx;
    }
}
class Bot1 extends Composer1 {
    token;
    pollingRunning = false;
    pollingAbortController;
    lastTriedUpdateId = 0;
    api;
    botInfo;
    clientConfig;
    ContextConstructor;
    errorHandler = async (err)=>{
        console.error('Error in middleware while handling update', err.ctx?.update?.update_id, err.error);
        console.error('No error handler was set!');
        console.error('Set your own error handler with `bot.catch = ...`');
        if (this.pollingRunning) {
            console.error('Stopping bot');
            await this.stop();
        }
        throw err;
    };
    constructor(token3, config3){
        super();
        this.token = token3;
        if (token3.length === 0) throw new Error('Empty token!');
        this.botInfo = config3?.botInfo;
        this.clientConfig = config3?.client;
        this.ContextConstructor = config3?.ContextConstructor ?? Context1;
        this.api = new Api1(token3, this.clientConfig);
    }
    async init() {
        if (this.botInfo === undefined) {
            debug2('Initializing bot');
            this.botInfo = await this.api.getMe();
        } else {
            debug2('Bot already initialized!');
        }
        debug2(`I am ${this.botInfo.username}!`);
    }
    async handleUpdate(update, webhookReplyEnvelope) {
        if (this.botInfo === undefined) throw new Error('Bot not initialized!');
        debug2(`Processing update ${update.update_id}`);
        const api2 = new Api1(this.token, this.clientConfig, webhookReplyEnvelope);
        const t = this.api.config.installedTransformers();
        if (t.length > 0) api2.config.use(...t);
        const ctx1 = new this.ContextConstructor(update, api2, this.botInfo);
        try {
            await run(this.middleware(), ctx1);
        } catch (err) {
            debugErr(`Error in middleware for update ${update.update_id}`);
            throw new BotError1(err, ctx1);
        }
    }
    async start(options) {
        await this.init();
        if (this.pollingRunning) {
            debug2('Simple long polling already running!');
            return;
        }
        await this.api.deleteWebhook({
            drop_pending_updates: options?.drop_pending_updates
        });
        debug2('Starting simple long polling');
        this.pollingRunning = true;
        this.pollingAbortController = new AbortController();
        const limit = options?.limit;
        const timeout = options?.timeout ?? 30;
        let allowed_updates = options?.allowed_updates;
        while(this.pollingRunning){
            const offset = this.lastTriedUpdateId + 1;
            let updates = undefined;
            let maxRetries = 1200;
            do {
                try {
                    updates = await this.api.getUpdates({
                        offset,
                        limit,
                        timeout,
                        allowed_updates
                    }, this.pollingAbortController.signal);
                } catch (error1) {
                    if (this.pollingRunning && error1 instanceof GrammyError1) {
                        debugErr(`Call to \`getUpdates\` failed, retrying in 3 seconds ...`);
                        await new Promise((r)=>setTimeout(r, 3000)
                        );
                    } else {
                        throw error1;
                    }
                }
            }while (updates === undefined && this.pollingRunning && (maxRetries--) > 0)
            if (updates === undefined) break;
            for (const update2 of updates){
                this.lastTriedUpdateId = update2.update_id;
                try {
                    await this.handleUpdate(update2);
                } catch (err) {
                    await this.errorHandler(err);
                }
            }
            allowed_updates = undefined;
        }
    }
    async stop() {
        if (this.pollingRunning) {
            debug2('Stopping bot, saving update offset');
            this.pollingRunning = false;
            this.pollingAbortController?.abort();
            await this.api.getUpdates({
                offset: this.lastTriedUpdateId + 1
            });
            this.pollingAbortController = undefined;
        } else {
            debug2('Bot is not running!');
        }
    }
    catch(errorHandler) {
        this.errorHandler = errorHandler;
    }
}
class Keyboard1 {
    keyboard = [
        []
    ];
    add(...buttons) {
        this.keyboard[this.keyboard.length - 1]?.push(...buttons);
        return this;
    }
    row(...buttons) {
        this.keyboard.push(buttons);
        return this;
    }
    text(text) {
        return this.add({
            text
        });
    }
    requestContact(text) {
        return this.add({
            text,
            request_contact: true
        });
    }
    requestLocation(text) {
        return this.add({
            text,
            request_location: true
        });
    }
    requestPoll(text, type) {
        return this.add({
            text,
            request_poll: {
                type
            }
        });
    }
    build() {
        return this.keyboard;
    }
}
class InlineKeyboard1 {
    inline_keyboard = [
        []
    ];
    add(...buttons) {
        this.inline_keyboard[this.inline_keyboard.length - 1]?.push(...buttons);
        return this;
    }
    row(...buttons) {
        this.inline_keyboard.push(buttons);
        return this;
    }
    url(text, url) {
        return this.add({
            text,
            url
        });
    }
    login(text, loginUrl) {
        return this.add({
            text,
            login_url: typeof loginUrl === 'string' ? {
                url: loginUrl
            } : loginUrl
        });
    }
    text(text, data = text) {
        return this.add({
            text,
            callback_data: data
        });
    }
    switchInline(text, query = '') {
        return this.add({
            text,
            switch_inline_query: query
        });
    }
    switchInlineCurrent(text, query = '') {
        return this.add({
            text,
            switch_inline_query_current_chat: query
        });
    }
    game(text) {
        return this.add({
            text,
            callback_game: {
            }
        });
    }
    pay(text) {
        return this.add({
            text,
            pay: true
        });
    }
}
export { Keyboard1 as Keyboard };
export { InlineKeyboard1 as InlineKeyboard };
const debug3 = browser$1('grammy:session');
function session1(options2) {
    const getSessionKey = options2?.getSessionKey ?? defaultGetSessionKey;
    const storage = options2?.storage ?? new MemorySessionStorage();
    return async (ctx1, next)=>{
        const key = await getSessionKey(ctx1);
        let value = key === undefined ? undefined : await storage.read(key) ?? options2?.initial?.();
        Object.defineProperty(ctx1, 'session', {
            get () {
                if (key === undefined) throw new Error('Cannot access session data because the session key was undefined!');
                return value;
            },
            set (v) {
                if (key === undefined) throw new Error('Cannot assign session data because the session key was undefined!');
                value = v;
            }
        });
        await next();
        if (key !== undefined) {
            if (value == null) await storage.delete(key);
            else await storage.write(key, value);
        }
    };
}
function lazySession1(options2) {
    const getSessionKey = options2?.getSessionKey ?? defaultGetSessionKey;
    const storage = options2?.storage ?? new MemorySessionStorage();
    return async (ctx1, next)=>{
        const key = await getSessionKey(ctx1);
        let value = undefined;
        let promise = undefined;
        let wrote = false;
        let read = false;
        let fetching = false;
        Object.defineProperty(ctx1, 'session', {
            get () {
                if (wrote) return value;
                if (key === undefined) throw new Error('Cannot access lazy session data because the session key was undefined!');
                read = true;
                return promise ??= (fetching = true, Promise.resolve(storage.read(key)).then((v)=>{
                    if (!fetching) return value;
                    if (v === undefined) {
                        v = options2?.initial?.();
                        if (v !== undefined) {
                            wrote = true;
                            value = v;
                        }
                    } else {
                        value = v;
                    }
                    return value;
                }));
            },
            set (v) {
                if (key === undefined) throw new Error('Cannot assign lazy session data because the session key was undefined!');
                wrote = true;
                fetching = false;
                value = v;
            }
        });
        await next();
        if (key !== undefined) {
            if (read) await promise;
            if (read || wrote) {
                value = await value;
                if (value == null) await storage.delete(key);
                else await storage.write(key, value);
            }
        }
    };
}
function defaultGetSessionKey(ctx1) {
    return ctx1.chat?.id.toString();
}
class MemorySessionStorage {
    timeToLive;
    storage = new Map();
    constructor(timeToLive = Infinity){
        this.timeToLive = timeToLive;
        debug3('Storing session data in memory, all data will be lost when the bot restarts.');
    }
    read(key) {
        const value = this.storage.get(key);
        if (value === undefined) return undefined;
        if (value.expires !== undefined && value.expires < Date.now()) {
            this.delete(key);
            return undefined;
        }
        return value.session;
    }
    write(key, value) {
        this.storage.set(key, this.addExpiryDate(value));
    }
    addExpiryDate(value) {
        const ttl = this.timeToLive;
        if (ttl !== undefined && ttl < Infinity) {
            const now = Date.now();
            return {
                session: value,
                expires: now + ttl
            };
        } else {
            return {
                session: value
            };
        }
    }
    delete(key) {
        this.storage.delete(key);
    }
}
export { session1 as session };
export { lazySession1 as lazySession };
const debugErr1 = browser$1('grammy:error');
const standard = (req, res)=>({
        update: req.body,
        respond: (json)=>res.send(json)
    })
;
const withCtx = (ctx1)=>({
        update: ctx1.req.body,
        respond: (json)=>ctx1.response.body = json
    })
;
const frameworkAdapters = {
    express: standard,
    http: standard,
    https: standard,
    koa: withCtx,
    oak: withCtx,
    fastify: standard
};
function webhookCallback1(bot, framework = 'express', onTimeout = 'throw', timeoutMilliseconds = 10000) {
    const server = frameworkAdapters[framework] ?? standard;
    let firstUpdate = true;
    let initialized = false;
    let initCall;
    return async (...args)=>{
        const { update: update2 , respond  } = server(...args);
        const webhookReplyEnvelope3 = {
            send: async (json)=>{
                await respond(json);
            }
        };
        if (!initialized) {
            if (firstUpdate) {
                initCall = bot.init();
                firstUpdate = false;
            }
            await initCall;
            initialized = true;
        }
        await timeoutIfNecessary(bot.handleUpdate(update2, webhookReplyEnvelope3), typeof onTimeout === 'function' ? ()=>onTimeout(...args)
         : onTimeout, timeoutMilliseconds);
    };
}
function timeoutIfNecessary(task, onTimeout, timeout) {
    if (timeout === Infinity) return task;
    return new Promise((resolve3, reject)=>{
        const handle = setTimeout(()=>{
            if (onTimeout === 'throw') {
                reject(new Error(`Request timed out after ${timeout} ms`));
            } else {
                if (typeof onTimeout === 'function') onTimeout();
                resolve3();
            }
            const now = Date.now();
            task.finally(()=>{
                const diff = Date.now() - now;
                debugErr1(`Request completed ${diff} ms after timeout!`);
            });
        }, timeout);
        task.then(resolve3).catch(reject).finally(()=>clearTimeout(handle)
        );
    });
}
export { webhookCallback1 as webhookCallback };
export { BotError1 as BotError, Bot1 as Bot };
export { InputFile1 as InputFile };
export { Context1 as Context };
export { Composer1 as Composer };
export { matchFilter1 as matchFilter };
export { Api1 as Api };
export { GrammyError1 as GrammyError };
