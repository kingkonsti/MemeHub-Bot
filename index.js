const { Composer, log, session } = require('micro-bot');
const db = require('./js/mongo-db');
const forward = require('./js/meme-forwarding');
const upvote = require('./js/meme-upvoting');
const upweeb = require('./js/meme-upweebing');
const stats = require('./js/statistics');
const categoriesStage = require('./js/categories');


const callback_handlers = {
    "upvote": upvote.handle_upvote_request,
    "upweeb": upweeb.handle_upweeb_request
};

const bot = new Composer()
db.init();

bot.use(log());
bot.use(session());
categoriesStage.init(bot);

bot.start(({ reply }) => reply('Welcome to the Memehub bot!'));
bot.help(({ reply }) => reply('Just send me memes! You can add categories by adding a caption.'));

bot.on('photo', forward.handle_meme_request);
bot.on('animation', forward.handle_meme_request);
bot.on('video', forward.handle_meme_request);

bot.on('callback_query', (ctx) => {
    if (!ctx.update.callback_query.data in callback_handlers || ctx.update.callback_query.from.is_bot) {
        ctx.answerCbQuery();
        return;
    }

    callback_handlers[ctx.update.callback_query.data](ctx);
});

bot.command('top', stats.my_top); // zeigt mein Meme mit den meisten Upvotes an
bot.command('avg', stats.my_average); // zeigt durchschnittliche Upvotes auf meine Memes an
bot.command('sum', stats.user_overview); // zeigt memer mit deren Anzahl an Uploads an


module.exports = bot