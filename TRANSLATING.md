# Translation Guide

## Introduction

It is possible to translate the website to other languages, and anyone is very welcome to do so.

Note that we’re taking translations very seriously.
They should be loved as much as the English version.

For example, Google Translate is already built into Google Chrome.
Don’t bother to use software to create translations of the docs.
If we create a translation of the docs for a new language, then because we want high quality translations written by native speakers or near-native speakers.
Examples and real-world comparisons must be replaced by equivalents in the culture of the respective country.
A good translation is hard and it takes time.
We don’t want partial or outdated translations.

Anyone who wants to start a new language should ask themselves the following questions before putting any work into docs.

1. How much of the documentation do you want to translate?
   If the answer isn’t to get to 100 % eventually, don’t start.
2. How long are you going to stick around in bot development?
   grammY is young.
   It evolves quickly and there are many articles that get changed often.
   The translations must be kept in sync with the English original.
   Outdated and wrong docs are much worse than no docs.
   Many people only come here for a few months (and that’s fine!), but if you translate everything and then stop developing bots and stop updating the articles, we’ll have to remove that language again.
   Then it was a waste of time for you.
   So if you don’t want to commit long-term, don’t start.
3. How many hours per week can you spend in the beginning?
   It’s understandable that a first PR doesn’t contain translations for all pages immediately.
   However, if you can only work on it rarely, it’s going to take a very long time until you’re done.
   We don’t want to end up with 15 languages and none of them is done for months.
   If you can’t set aside enough free time to get this done, don’t start.

Still eager to join us?
Great!
Here is how we work:

## The Translation Workflow

Translating the grammY docs into a language happens in two stages: the Active Stage and the Maintenance Stage.

When a language is first started, no translations are available.
Hence, the complete website must be translated actively (Active Stage).
This requires an insane amount of work and a fair bit of dedication.
Do not underestimate the time you will need for this.
Respect to everyone who manages to complete the work!

The language will then enter Maintenance Stage.
From here on, all that needs to be done is to keep notifications on for new pull requests, and sync the translations whenever an article gets updated.

Here is some more information about how each stage works.

### Active Stage

A translation to another language must be 100 % complete before it gets published.
We do not accept partial translations.
All menus, links, articles, comments, and everything translatable must be localised before the changes can finally go live on the website.
Please open a translation tracking issue so everyone can follow the progress.
It can look like https://github.com/grammyjs/website/issues/55.

It would be very painful to do everything in a single pull request, so we developed a simple branching model which will make this easy.

Once you start working on a new language, we will give push permission to this repository.
You can then create a new branch for the translations, e.g. `feat/spanish-translations`.
This is called the _translation branch_ of your language.

For every page you translate, create a new branch, perform the translations, and open a pull request.
Make sure to open a pull request against your translation branch, and not against `main`.

A different person who can speak your language can now review the pull request.
Make sure to reiterate on the translations, in case you have ideas to improve it.
The GitHub bot will provide you with a website preview of your pull request, so you can review a fully rendered version of how your changes will look, which will enable you to catch all mistakes.
Once you both think that the translation is perfect, merge the pull request into the translation branch of your language.

You should keep track of which pages are translated in your translation tracking issue.
If we update an article that is already translated, you need to open a new pull request against your translation branch which syncs up the changes.
That way, it is always guaranteed that the articles in the translation branch are up to date.

Once everything is translated, the translation branch can be merged into `main`.
You can now close your progress tracking issue.
Your translations go live immediately.
Your language has now entered the Maintenance Stage.

### Maintenance Stage

Your language is 100 % translated and perfectly in sync with the English original.
Great job!
At this point, all you need to do is to keep it that way.

Whenever an English article is updated (by us, you, or anyone else), a pull request will be opened.
It usually takes some time before we get the content right, so don’t bother translating anything at this point yet.

Once the content is finalised, we add the “ready for translation” label.
This is a guarantee that the English version is not going to change anymore.
You should now push more commits to the existing branch which sync up the changes to your language.
It is recommended to have a second person review your translations, but this is less strict than in the Active Stage.

Once you are satisfied with your work, add the label of your language, e.g. “🇪🇸 ES”.
Now we have a good overview over which translations are done and which ones are missing.
As soon as all translations are added (this usually takes 2-3 days), the pull request can be merged.
The change immediately goes live for all languages at the same time.

Some pull requests do not require a translation.
They are labeled with “not translatable”.
You can safely ignore them.
