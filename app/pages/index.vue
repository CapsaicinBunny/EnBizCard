<template>
  <div
    ref="container"
    class="container relative bg-gray-900 mx-auto text-gray-100"
    style="max-width: 960px"
  >
    <Modal
      v-if="content"
      @click.self="clearContent"
      :content="content"
      :clearContent="clearContent"
    />
    <transition name="drop">
      <div
        v-if="inView || showPreview"
        class="fixed top-0 w-full z-30 bg-gray-900 justify-between items-center flex md:hidden"
      >
        <div class="logo w-16 m-4" v-html="$icon('logo')"></div>
        <button
          class="p-3 mx-4 font-extrabold rounded tracking-wide focus:outline-none select-none"
          :class="showPreview ? 'bg-gray-700' : 'bg-emerald-600'"
          @click="!opening && togglePreview()"
        >
          {{ showPreview ? 'Close preview' : 'Open preview' }}
        </button>
      </div>
    </transition>
    <transition name="fade">
      <Preview
        v-show="showPreview"
        class="fixed top-20 w-full bottom-0 z-20 border-none rounded-b-none"
        ref="html"
        :username="username"
        :genInfo="genInfo"
        :images="images"
        :featured="featured"
        :colors="colors"
        :primaryActions="primaryActions"
        :secondaryActions="secondaryActions"
        :PreviewMode="PreviewMode"
        :downloadVcard="downloadVcard"
        :footerCredit="footerCredit"
        :showAlert="showAlert"
        :hasLightBG="hasLightBG"
        :downloadKey="downloadKey"
        :pubKeyIsValid="pubKeyIsValid"
      />
    </transition>

    <div class="px-4">
      <div class="flex items-start pt-8">
        <div
          class="logo w-24"
          v-html="$icon('logo')"
          title="EnBizCard - An Open-Source Digital Business Card Generator"
        ></div>
      </div>
      <h1
        class="text-3xl md:text-5xl font-extrabold mt-24 md:mt-48 md:leading-tight"
      >
        Why Pay When Your Website Can Host Your Digital Business Cards for Free!
      </h1>
      <p class="mt-8 text-lg md:text-xl w-full md:w-3/4 text-gray-200">
        EnBizCard helps you create beautiful, responsive HTML&#8209;based
        digital business cards that can be hosted on your website.
      </p>
      <ul class="mt-4 text-gray-400">
        <li>-&ensp;No sign-up required</li>
        <li>-&ensp;100% free and open-source</li>
        <li>-&ensp;No user tracking and data collection</li>
        <li>-&ensp;Works offline</li>
      </ul>
      <div class="mt-4 flex flex-wrap items-center">
        <button
          class="font-extrabold leading-none text-lg tracking-wide select-none shrink-0 p-5 mt-2 mr-2 text-white bg-emerald-600 rounded hover:bg-emerald-500 focus:bg-emerald-500 transition-colors duration-200 focus:outline-none"
          @click="create()"
        >
          Create your own
        </button>
        <a
          class="font-extrabold leading-none text-lg tracking-wide shrink-0 p-5 mt-2 text-white bg-gray-700 rounded hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200"
          href="/demo"
          target="_blank"
          >View demo</a
        >
      </div>
      <p class="mt-6">
        Read the
        <NuxtLink
          to="/hosting-guide"
          class="cursor-pointer underline font-extrabold text-emerald-600 hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200"
          >Hosting Guide</NuxtLink
        >
      </p>
    </div>
    <div class="md:grid md:grid-cols-2">
      <div class="px-4 mt-32">
        <div ref="create" id="step-1" class="pt-8">
          <h2 class="font-extrabold text-2xl">Header attachments</h2>
          <div class="stepC">
            <Attachment
              :content="images"
              type="logo"
              :resizeImage="resizeImage"
              label="Add logo"
              description="suggested format: svg, png or gif"
              :showAlert="showAlert"
            />
            <Attachment
              :content="images"
              type="cover"
              :resizeImage="resizeImage"
              label="Add cover photo"
              description="suggested format: svg, jpeg, png or gif"
              :showAlert="showAlert"
            />
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Recommended cover photo size is 960 x 640 pixels, with an aspect
              ratio of 3:2
            </p>
          </div>
        </div>
        <div id="step-2" class="mt-16">
          <h2 class="font-extrabold text-2xl">Contact information</h2>
          <Attachment
            :content="images"
            type="photo"
            :resizeImage="resizeImage"
            label="Add profile photo"
            description="suggested format: jpeg, png or gif"
            :showAlert="showAlert"
          />
          <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
            Recommended profile photo size is 320 x 320 pixels, with an aspect
            ratio of 1:1
          </p>
          <div class="stepC mt-6 grid grid-cols-2 gap-4">
            <div>
              <label for="firstname" class="ml-4">First name</label>
              <input
                id="firstname"
                spellcheck="false"
                type="text"
                v-model="genInfo.fname"
                autocapitalize="words"
                class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
              />
            </div>
            <div>
              <label for="lastname" class="ml-4">Last name</label>
              <input
                id="lastname"
                spellcheck="false"
                type="text"
                v-model="genInfo.lname"
                autocapitalize="words"
                class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
              />
            </div>
          </div>
          <div class="stepC mt-6">
            <label for="pronouns" class="ml-4">Gender pronouns</label>
            <input
              id="pronouns"
              spellcheck="false"
              type="text"
              v-model="genInfo.pronouns"
              placeholder="He/Him/His"
              autocapitalize="words"
              class="mt-2 px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
            />
          </div>
          <div class="stepC mt-6">
            <label for="job-title" class="ml-4">Job title</label>
            <input
              id="job-title"
              type="text"
              spellcheck="true"
              autocapitalize="words"
              v-model="genInfo.title"
              class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
            />
          </div>
          <div class="stepC mt-6">
            <label for="business-name" class="ml-4">Business name</label>
            <input
              id="business-name"
              spellcheck="false"
              type="text"
              v-model="genInfo.biz"
              autocapitalize="words"
              class="mt-2 px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
            />
          </div>
          <div class="stepC mt-6">
            <label for="business-address" class="ml-4">Business address</label>
            <textarea
              id="business-address"
              :value="genInfo.addr"
              @input="genInfo.addr = $event.target.value"
              class="block mt-2 px-4 py-3 w-full bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600"
              rows="4"
            ></textarea>
          </div>
          <div class="stepC mt-6">
            <label for="business-description" class="ml-4"
              >Business description
            </label>
            <textarea
              id="business-description"
              :value="genInfo.desc"
              @input="genInfo.desc = $event.target.value"
              class="block mt-2 px-4 py-3 w-full bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600"
              rows="4"
            ></textarea>
          </div>
          <div class="stepC relative mt-6">
            <label for="pgp-public-key" class="flex justify-between ml-4"
              >OpenPGP public key<span
                v-if="genInfo.key"
                class="mr-4"
                :class="pubKeyIsValid ? 'text-emerald-500' : 'text-red-600'"
                >{{ pubKeyIsValid ? 'Valid' : 'Invalid schema' }}</span
              >
            </label>
            <textarea
              id="pgp-public-key"
              v-model="genInfo.key"
              class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600"
              rows="4"
              spellcheck="false"
              placeholder="Paste public key block here"
            ></textarea>
          </div>
        </div>
        <div id="step-3" class="mt-16">
          <h2 class="font-extrabold text-2xl">Primary actions</h2>
          <VueDraggable
            v-model="primaryActions"
            handle=".drag"
            :animation="1"
            ghost-class="ghost"
            target=".sortable-primary"
          >
            <transition-group
              tag="div"
              type="transition"
              name="list"
              class="sortable-primary"
            >
              <Action
                v-for="(item, index) in primaryActions"
                :key="item.name"
                name="primaryActions"
                :type="primaryActions"
                :item="item"
                :index="index"
                :buttonBg="colors.buttonBg.color"
                :removeAction="removeAction"
              />
            </transition-group>
          </VueDraggable>
          <div
            class="mt-6 border-gray-800"
            :class="{ 'border-t pt-6': primaryActions.length }"
          >
            <input
              spellcheck="false"
              type="text"
              v-model="filterPrimary"
              placeholder="Search an action"
              class="px-4 mb-2 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
              @keydown.esc="clearFilterActions"
              @keypress.enter="
                filteredAction('filteredPrimaryActions', 'primaryActions')
              "
            />
            <p class="p-3" v-if="filteredPrimaryActions.length < 1">
              Can't find an action? Please
              <a
                href="#help"
                class="cursor-pointer underline font-extrabold text-emerald-600 hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200"
                >leave your suggestion</a
              >
              on Telegram
            </p>
            <div class="stepC actions">
              <button
                v-for="(action, index) in filteredPrimaryActions"
                :key="index"
                @click="addAction('primaryActions', action.name)"
                class="p-3 flex items-center shrink-0 rounded hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none bg-gray-700"
                :title="action.name"
                :aria-label="action.name"
              >
                <div
                  class="w-6 h-6 mr-3 shrink-0"
                  v-html="$icon(action.icon)"
                ></div>
                <p class="whitespace-nowrap">{{ action.name }}</p>
              </button>
            </div>
          </div>
        </div>
        <div id="step-4" class="mt-16">
          <h2 class="font-extrabold text-2xl">Social &amp; online profiles</h2>
          <p class="mt-2 text-sm text-gray-400">
            Add the places where people can follow, support, or explore your
            work.
          </p>
          <VueDraggable
            v-model="secondaryActions"
            handle=".drag"
            :animation="1"
            ghost-class="ghost"
            target=".sortable-secondary"
          >
            <transition-group
              tag="div"
              type="transition"
              name="list"
              class="sortable-secondary"
            >
              <Action
                v-for="(item, index) in secondaryActions"
                :key="item.name"
                name="secondaryActions"
                :type="secondaryActions"
                :item="item"
                :index="index"
                :removeAction="removeAction"
              />
            </transition-group>
          </VueDraggable>
          <div
            class="mt-6 border-gray-800"
            :class="{ 'border-t pt-6': secondaryActions.length }"
          >
            <input
              spellcheck="false"
              type="text"
              v-model="filterSecondary"
              placeholder="Search profiles"
              aria-label="Search social and online profiles"
              class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
              @keydown.esc="clearFilterActions"
              @keypress.enter="
                filteredAction('filteredSecondaryActions', 'secondaryActions')
              "
            />
            <div
              v-if="!filterSecondary"
              class="mt-3 flex flex-wrap gap-2"
              aria-label="Profile categories"
            >
              <button
                v-for="category in secondaryActionCategories"
                :key="category.id"
                type="button"
                :aria-pressed="secondaryCategory === category.id"
                @click="secondaryCategory = category.id"
                class="px-3 py-2 rounded-full shrink-0 text-sm font-extrabold border transition-colors duration-200 focus:outline-none focus:ring-3 ring-gray-100"
                :class="
                  secondaryCategory === category.id
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                "
              >
                {{ category.label }}
              </button>
            </div>
            <div class="mt-2 mb-3 flex items-baseline justify-between gap-3">
              <p class="text-sm font-extrabold text-gray-300">
                {{ secondaryResultsLabel }}
              </p>
              <p class="text-xs text-gray-500">
                {{ filteredSecondaryActions.length }} available
              </p>
            </div>
            <p class="p-3" v-if="filteredSecondaryActions.length < 1">
              Can't find a profile? Please
              <a
                href="https://github.com/CapsaicinBunny/EnBizCard/issues"
                target="_blank"
                rel="noopener noreferrer"
                class="cursor-pointer underline font-extrabold text-emerald-600 hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200"
                >suggest one on GitHub</a
              >
            </p>
            <div class="profile-grid grid grid-cols-2 gap-2">
              <button
                v-for="action in filteredSecondaryActions"
                :key="action.name"
                @click="addAction('secondaryActions', action.name)"
                class="profile-card min-w-0 p-3 flex items-center rounded hover:brightness-125 focus:brightness-125 transition-all duration-200 focus:outline-none focus:ring-3 ring-white"
                :style="{ background: action.color }"
                :title="action.name"
                :aria-label="`Add ${action.name}`"
              >
                <div
                  class="w-6 h-6 mr-3 shrink-0"
                  v-html="$icon(action.icon)"
                ></div>
                <p class="truncate" :class="{ 'text-gray-900': action.light }">
                  {{ action.name }}
                </p>
              </button>
            </div>
          </div>
          <!-- class="stepC actions mt-6 border-gray-800"
            :class="{ 'border-t pt-6': secondaryActions.length }" -->
        </div>
        <div id="step-5" class="mt-16">
          <h2 class="font-extrabold text-2xl">Featured content</h2>
          <div class="stepC">
            <VueDraggable
              v-model="featured"
              handle=".drag"
              :animation="1"
              ghost-class="ghost"
              target=".sortable-featured"
            >
              <transition-group
                tag="div"
                type="transition"
                name="list"
                class="sortable-featured"
              >
                <Featured
                  v-for="(content, index) in featured"
                  :key="'content' + index"
                  :featured="featured"
                  :resizeImage="resizeImage"
                  :index="index"
                  mimetypes="image/jpeg, image/png, audio/mpeg, video/mp4, video/webm, application/pdf"
                  :showAlert="showAlert"
                />
              </transition-group>
            </VueDraggable>

            <div class="flex mt-6">
              <div class="flex flex-wrap items-center">
                <button
                  class="p-3 rounded bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
                  @click="addFeature()"
                  aria-label="Add section"
                >
                  <div class="w-6 h-6" v-html="$icon('add')"></div>
                </button>
                <p class="ml-3 leading-none">Add section</p>
              </div>
            </div>
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Supported media formats: jpeg, png, mp3, mp4, webm and pdf
            </p>
          </div>
        </div>
        <div id="step-6" class="mt-16">
          <h2 class="font-extrabold text-2xl">Footer credit</h2>
          <div class="stepC mt-6">
            <div class="flex items-center">
              <div
                class="relative group inline-block w-24 h-12 mr-3 align-middle select-none transition duration-200 ease-in bg-gray-700 rounded hover:bg-gray-600 focus:bg-gray-600 cursor-pointer focus:outline-none"
                :class="{
                  'bg-emerald-600 hover:bg-emerald-500 focus:bg-emerald-500':
                    footerCredit,
                }"
                tabindex="0"
                @click="footerCredit = !footerCredit"
                @keypress.space.enter.prevent="footerCredit = !footerCredit"
              >
                <transition name="slide">
                  <input
                    type="checkbox"
                    name="toggle"
                    aria-label="Toggle footer credit"
                    id="toggle"
                    v-model="footerCredit"
                    class="toggle-switch absolute block w-10 h-10 m-1 rounded border-4 border-transparent appearance-none cursor-pointer transition-colors duration-200 focus:outline-none bg-white"
                    tabindex="-1"
                  />
                </transition>
              </div>
              <p>{{ footerCredit ? 'Enabled' : 'Disabled' }}</p>
            </div>
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              By enabling the footer credit, you can help this project reach
              more people.
            </p>
          </div>
        </div>
        <div id="step-7" class="mt-16">
          <h2 class="font-extrabold text-2xl">Themes</h2>
          <div class="stepC mt-3 flex flex-wrap">
            <button
              @click="changeTheme(1)"
              class="w-12 h-12 rounded mt-3 mr-3 font-extrabold focus:outline-none transition-colors duration-200"
              :class="
                theme == 1
                  ? 'bg-emerald-600'
                  : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'
              "
            >
              A
            </button>
            <button
              @click="changeTheme(2)"
              class="w-12 h-12 rounded mt-3 mr-3 font-extrabold focus:outline-none transition-colors duration-200"
              :class="
                theme == 2
                  ? 'bg-emerald-600'
                  : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'
              "
            >
              B
            </button>
            <button
              @click="changeTheme(3)"
              class="w-12 h-12 rounded mt-3 mr-3 font-extrabold focus:outline-none transition-colors duration-200"
              :class="
                theme == 3
                  ? 'bg-emerald-600'
                  : 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600'
              "
            >
              C
            </button>
          </div>
        </div>
        <div id="step-8" class="mt-16">
          <h2 class="font-extrabold text-2xl">Colours</h2>
          <div class="stepC">
            <Colour name="logoBg" label="Header background" :colors="colors" />
            <Colour name="mainBg" label="Main background" :colors="colors" />
            <Colour
              name="buttonBg"
              label="Button background"
              :colors="colors"
            />
            <Colour
              name="cardBg"
              label="Featured content background"
              :colors="colors"
            />
          </div>
        </div>
        <div id="step-9" class="mt-16">
          <h2 class="font-extrabold text-2xl">Fonts</h2>
          <p class="mt-2 text-gray-400">
            Pick a font for your card, or choose Custom to paste an embed code
            from any font service.
          </p>
          <div
            class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2"
            aria-label="Card fonts"
          >
            <button
              v-for="preset in fontPresets"
              :key="preset.id"
              type="button"
              :aria-pressed="fontPreset === preset.id"
              :title="`${preset.name} — ${preset.note}`"
              @click="selectFontPreset(preset.id)"
              class="px-3 py-2 text-left rounded border transition-colors duration-200 focus:outline-none focus:ring-3 ring-gray-100"
              :class="
                fontPreset === preset.id
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              "
            >
              <span class="block font-extrabold truncate">{{
                preset.name
              }}</span>
              <span
                class="block text-xs truncate"
                :class="
                  fontPreset === preset.id
                    ? 'text-emerald-100'
                    : 'text-gray-500'
                "
                >{{ preset.note }}</span
              >
            </button>
          </div>
          <p
            v-if="fontPreset !== 'default' && fontPreset !== 'custom'"
            class="mt-4 text-sm text-gray-500"
          >
            Loaded from Google Fonts. Your card stays self-hosted, but readers'
            browsers will fetch the font file from Google when they open it.
          </p>
          <div v-show="fontPreset === 'custom'" class="stepC mt-6">
            <label for="font-link" class="ml-4">Web font embed code</label>
            <textarea
              id="font-link"
              v-model="genInfo.fontLink"
              class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600"
              rows="4"
              spellcheck="false"
              :placeholder="`<link href=&quot;https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap&quot; rel=&quot;stylesheet&quot;>`"
            ></textarea>
          </div>
          <div v-show="fontPreset === 'custom'" class="stepC mt-6">
            <label for="font-css" class="ml-4">Web font CSS rule</label>
            <input
              spellcheck="false"
              type="text"
              id="font-css"
              v-model="genInfo.fontCss"
              class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600"
              :placeholder="`font-family: 'Poppins', sans-serif;`"
            />
          </div>
          <p
            v-if="fontPreset === 'custom'"
            class="mt-6 border p-4 rounded border-gray-700 text-gray-400"
          >
            Supports services such as Google Fonts, Adobe Typekit, etc. Make
            sure to get the embed code for both regular and bold font variants
            from the same font family.
          </p>
        </div>
        <div id="step-10" class="mt-16">
          <h2 class="font-extrabold text-2xl">Analytics</h2>
          <div class="stepC mt-6">
            <label for="tracking-code" class="ml-4">Tracking code</label>
            <textarea
              id="tracking-code"
              aria-label="tracking-code"
              v-model="genInfo.tracker"
              class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600"
              rows="4"
              spellcheck="false"
              placeholder="Paste tracking code here"
            ></textarea>
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Supports services such as Clicky, Matomo, Google Analytics etc.
            </p>
          </div>
        </div>
        <div id="step-11" class="mt-16">
          <h2 class="font-extrabold text-2xl">Hosting</h2>
          <div class="stepC mt-6">
            <label for="hosted-url" class="ml-4">Hosted card URL</label>
            <input
              spellcheck="false"
              type="text"
              id="hosted-url"
              v-model="hostedURL"
              class="block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 resize-none hover:border-gray-600"
              placeholder="https://yoursite/vcard/username"
            />
            <p class="mt-6 border p-4 rounded border-gray-700 text-gray-400">
              Only paste your hosting URL if you've already decided where you
              want to host this digital business card. If you haven't decided
              yet, please skip this step.
            </p>
          </div>
        </div>
        <Download
          :downloadCheckList="downloadCheckList"
          :downloadChecked="downloadChecked"
          :downloadPackage="downloadPackage"
        />
      </div>
      <div
        id="preview-container"
        class="relative w-full mt-20 sm:mt-0 hidden md:block"
      >
        <div
          id="preview"
          class="flex flex-col items-center justify-center sm:sticky sm:top-0 md:mx-6 lg:mx-12"
        >
          <div id="device" class="bg-black rounded sm:mt-10">
            <h2 class="text-center py-4 font-extrabold text-gray-200">
              LIVE PREVIEW
            </h2>
            <div id="browserFrame" class="overflow-hidden flex flex-col">
              <div
                id="topBar"
                class="topbar border-r-4 border-l-4 border-black bg-gray-900 z-10"
              >
                <div id="searchField" class="p-2 flex items-center">
                  <input
                    type="text"
                    class="pl-4 h-12 w-full bg-black rounded text-gray-500"
                    aria-label="vCard URL"
                    disabled
                    :value="'https://yoursite/vcard/' + username"
                    tabindex="-1"
                  />
                  <div class="w-6 ml-2" v-html="$icon('ellipsis')"></div>
                </div>
              </div>
              <Preview
                class="rounded-b-2xl"
                ref="html"
                :username="username"
                :genInfo="genInfo"
                :images="images"
                :featured="featured"
                :colors="colors"
                :primaryActions="primaryActions"
                :secondaryActions="secondaryActions"
                :PreviewMode="PreviewMode"
                :downloadVcard="downloadVcard"
                :footerCredit="footerCredit"
                :showAlert="showAlert"
                :hasLightBG="hasLightBG"
                :downloadKey="downloadKey"
                :pubKeyIsValid="pubKeyIsValid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Vcard ref="vCard" :vCard="vCard" />
    <SiteFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Modal from '@/components/Modal.vue'
import Attachment from '@/components/Attachment.vue'
import Action from '@/components/Action.vue'
import Featured from '@/components/Featured.vue'
import Colour from '@/components/Colour.vue'
import Preview from '@/components/Preview.vue'
import Download from '@/components/Download.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import Cropper from '@/components/Cropper.vue'

import Vcard from '@/components/Vcard.vue'
import type {
  CardActions,
  CardColours,
  CardImage,
  CardImages,
  ColourSlot,
  DownloadCheckItem,
  FeaturedSection,
  FontPreset,
  GenInfo,
  ImageSlot,
  MediaKind,
  PrimaryAction,
  ProductContent,
  SecondaryAction,
  SecondaryActionCategory,
  ResizeTarget,
  VCardData,
} from '~/types/card'
import { errorText } from '~/utils/errors'
import JSZip from 'jszip'
// vuedraggable@4 is unmaintained and breaks on Vue 3.3+ (its slot vnodes have a
// null `el`, so Sortable's context assignment throws). vue-draggable-plus is the
// maintained Vue 3 equivalent and keeps the transition-group markup via `target`.
import { VueDraggable } from 'vue-draggable-plus'

import { saveAs } from 'file-saver'
// Raw source text, bundled into the generated card package at download time.
// Vite's `?raw` replaces webpack's raw-loader; qrcode.min.js lives in public/
// because it is also loaded as a plain <script> by the generator itself.
import QRCode from '~~/public/qrcode.min.js?raw'
import Theme1 from '~/assets/styles/T1.min.css?raw'
import Theme2 from '~/assets/styles/T2.min.css?raw'
import Theme3 from '~/assets/styles/T3.min.css?raw'
// Compiled+minified source of the scripts that run inside a generated card.
// `?minified` (see nuxt.config.ts) rather than `?raw` because these are
// TypeScript: the export needs runnable JS, not the annotated source.
import modalScript from '~/assets/scripts/main.ts?minified'
import mediaScript from '~/assets/scripts/media.ts?minified'

type ProfilePickerCategory = 'popular' | SecondaryActionCategory

const SECONDARY_ACTION_CATEGORIES: ReadonlyArray<{
  id: ProfilePickerCategory
  label: string
}> = [
  { id: 'popular', label: 'Popular' },
  { id: 'social', label: 'Social' },
  { id: 'creative', label: 'Creative' },
  { id: 'media', label: 'Video & audio' },
  { id: 'developer', label: 'Developer' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'support', label: 'Support & payments' },
  { id: 'community', label: 'Communities' },
  { id: 'apps', label: 'Apps & reviews' },
  { id: 'shops', label: 'Shops' },
]

/**
 * Google Fonts embed tag for a family, at the regular and bold weights the
 * card actually uses. Both must come from one request: two separate <link>s
 * would not survive `getCssHref`, which reads only the first stylesheet it
 * finds in `fontLink`.
 */
function googleFontLink(family: string): string {
  const name = family.replaceAll(' ', '+')
  return `<link href="https://fonts.googleapis.com/css2?family=${name}:wght@400;700&display=swap" rel="stylesheet">`
}

const FONT_PRESETS: readonly FontPreset[] = [
  {
    id: 'default',
    name: 'Default',
    note: 'The reader’s own sans',
    link: '',
    css: '',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    note: 'Geometric sans',
    link: googleFontLink('Poppins'),
    css: "font-family: 'Poppins', sans-serif;",
  },
  {
    id: 'inter',
    name: 'Inter',
    note: 'Neutral UI sans',
    link: googleFontLink('Inter'),
    css: "font-family: 'Inter', sans-serif;",
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    note: 'Soft low-contrast sans',
    link: googleFontLink('DM Sans'),
    css: "font-family: 'DM Sans', sans-serif;",
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    note: 'Wide display sans',
    link: googleFontLink('Montserrat'),
    css: "font-family: 'Montserrat', sans-serif;",
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    note: 'Technical sans',
    link: googleFontLink('Space Grotesk'),
    css: "font-family: 'Space Grotesk', sans-serif;",
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    note: 'High-contrast serif',
    link: googleFontLink('Playfair Display'),
    css: "font-family: 'Playfair Display', serif;",
  },
  {
    id: 'lora',
    name: 'Lora',
    note: 'Readable text serif',
    link: googleFontLink('Lora'),
    css: "font-family: 'Lora', serif;",
  },
  {
    id: 'custom',
    name: 'Custom',
    note: 'Paste your own embed',
    link: '',
    css: '',
  },
]

const POPULAR_SECONDARY_ACTIONS: readonly string[] = [
  'Instagram',
  'LinkedIn',
  'Facebook',
  'YouTube',
  'TikTok',
  'X',
  'Bluesky',
  'GitHub',
  'Discord',
  'Spotify',
  'PayPal',
  'Threads',
]

const SECONDARY_ACTION_GROUPS: Record<
  SecondaryActionCategory,
  readonly string[]
> = {
  social: [
    'Instagram',
    'Threads',
    'Bluesky',
    'X',
    'Facebook',
    'LinkedIn',
    'TikTok',
    'Snapchat',
    'Pinterest',
    'Mastodon',
    'Pixelfed',
    'Friendica',
    'Diaspora',
    'VK',
  ],
  creative: ['Behance', 'Dribbble', 'ArtStation'],
  media: [
    'YouTube',
    'Twitch',
    'Spotify',
    'SoundCloud',
    'Vimeo',
    'PeerTube',
    'Funkwhale',
  ],
  developer: ['GitHub', 'GitLab', 'Codeberg'],
  publishing: ['Substack', 'Medium', 'Tumblr', 'Quora'],
  support: [
    'PayPal',
    'Cash App',
    'Patreon',
    'Ko-fi',
    'Buy me a coffee',
    'Open Collective',
    'Bitcoin',
    'Monero',
  ],
  community: ['Discord', 'Reddit', 'Siilo'],
  apps: [
    'App Store',
    'Play Store',
    'Angi',
    'Bark',
    'BuildZoom',
    'HomeAdvisor',
    'Houzz',
    'Networx',
    'Nextdoor',
    'Porch',
    'Thumbtack',
    'Yelp',
  ],
  shops: ['Amazon', 'Etsy', 'eBay'],
}

export default defineComponent({
  components: {
    Cropper,
    Modal,
    Attachment,
    Action,
    Featured,
    Colour,
    Preview,
    Download,
    SiteFooter,
    Vcard,
    VueDraggable,
  },

  setup() {
    // Replaces the Vuex store that previously held the selected theme.
    return { theme: useTheme() }
  },

  data() {
    return {
      downloadCheckList: [
        {
          label:
            'I did not attach any link or file that will cause any risk to the user',
          checked: false,
        },
        {
          label: 'I have verified that all the links are working correctly',
          checked: false,
        },
        {
          label: 'I have removed all unused fields and sections',
          checked: false,
        },
      ] as DownloadCheckItem[],
      images: {
        logo: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
        photo: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
        cover: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
      } as CardImages,
      colors: {
        logoBg: {
          color: `#059669`,
          openPalette: false,
        },
        mainBg: {
          color: `#ddd`,
          openPalette: false,
        },
        buttonBg: {
          color: `#059669`,
          openPalette: false,
        },
        cardBg: {
          color: `#fff`,
          openPalette: false,
        },
      } as CardColours,
      genInfo: {
        fname: null,
        lname: null,
        pronouns: null,
        title: null,
        biz: null,
        addr: null,
        desc: null,
        key: null,
        tracker: null,
        fontLink: null,
        fontCss: null,
      } as GenInfo,
      // The subsets currently shown in the card, filled by addAction().
      primaryActions: [] as PrimaryAction[],
      filterPrimary: '',
      secondaryActions: [] as SecondaryAction[],
      filterSecondary: '',
      secondaryCategory: 'popular' as ProfilePickerCategory,
      // Which font card is lit. Only ever set by selectFontPreset(), which
      // also writes genInfo.fontLink/fontCss — the two fields stay the single
      // source of truth for what the card actually renders.
      fontPreset: 'default',
      actions: {
        primaryActions: [
          {
            name: 'Mobile',
            icon: 'call',
            href: 'tel:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'Mobile number',
            order: 0,
            isURL: 0,
          },
          {
            name: 'Office',
            icon: 'call',
            href: 'tel:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'Office number',
            order: 1,
            isURL: 0,
          },
          {
            name: 'Home',
            icon: 'call',
            href: 'tel:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'Home number',
            order: 2,
            isURL: 0,
          },
          {
            name: 'SMS',
            icon: 'sms',
            href: 'sms:',
            placeholder: '+XX XXXXX XXXXX',
            value: null,
            label: 'SMS mobile number',
            order: 3,
            isURL: 0,
          },
          {
            name: 'Email',
            icon: 'email',
            href: 'mailto:',
            placeholder: 'info@example.com',
            value: null,
            label: 'Email address',
            order: 4,
          },
          {
            name: 'Website',
            icon: 'website',
            placeholder: 'https://example.com',
            value: null,
            label: 'Website URL',
            order: 5,
            isURL: 1,
          },
          {
            name: 'Store',
            icon: 'store',
            placeholder: 'https://example.com/storeID',
            value: null,
            label: 'Online Store URL',
            order: 6,
            isURL: 1,
          },
          {
            name: 'Location',
            icon: 'location',
            placeholder: 'https://osm.org/go/location',
            value: null,
            label: 'Map location URL',
            order: 7,
            isURL: 1,
          },

          {
            name: 'Signal',
            icon: 'signal',
            href: 'https://signal.me/#p/',
            placeholder: '+XXXXXXXXXXXX',
            value: null,
            label: 'Signal number with country code (no spaces)',
            order: 8,
            isURL: 1,
          },
          {
            name: 'Telegram',
            icon: 'telegram',
            href: 'https://t.me/',
            placeholder: 'username',
            value: null,
            label: 'Telegram username',
            order: 9,
            isURL: 1,
          },
          {
            name: 'Matrix',
            icon: 'matrix',
            href: 'https://matrix.to/#/',
            placeholder: '@username:matrix.org',
            value: null,
            label: 'Matrix userID',
            order: 10,
            isURL: 1,
          },
          {
            name: 'WhatsApp',
            icon: 'whatsapp',
            placeholder: 'https://wa.me/profileID',
            value: null,
            label: 'WhatsApp profile URL',
            order: 11,
            isURL: 1,
          },
          {
            name: 'Messenger',
            icon: 'messenger',
            href: 'https://m.me/',
            placeholder: 'username',
            value: null,
            label: 'Messenger username',
            order: 12,
            isURL: 1,
          },
          {
            name: 'Skype',
            icon: 'skype',
            href: 'skype:',
            hrefEnd: '?chat',
            placeholder: 'username',
            value: null,
            label: 'Skype username',
            order: 13,
            isURL: 1,
          },
          {
            name: 'Line',
            icon: 'line',
            href: 'https://line.me/ti/p/',
            placeholder: 'LINE ID',
            value: null,
            label: 'Line profile ID',
            order: 14,
            isURL: 1,
          },
          {
            name: 'Viber',
            icon: 'viber',
            href: 'viber://chat?number=',
            placeholder: 'XX XXXXX XXXXX',
            value: null,
            label: 'Viber mobile number',
            order: 15,
            isURL: 1,
          },
          {
            name: 'WeChat',
            icon: 'wechat',
            href: 'weixin://dl/chat?',
            placeholder: 'WeChat ID',
            value: null,
            label: 'WeChat profile ID',
            order: 16,
            isURL: 1,
          },
          {
            name: 'Calendar',
            icon: 'calendar',
            placeholder: 'https://example.com/calendarID',
            value: null,
            label: 'Calendar URL',
            order: 17,
            isURL: 1,
          },
          {
            name: 'XMPP',
            icon: 'xmpp',
            href: 'xmpp:',
            placeholder: 'XMPP ID',
            value: null,
            label: 'XMPP ID',
            order: 18,
            isURL: 1,
          },
          {
            name: 'imo',
            icon: 'imo',
            placeholder: 'https://imo.im/...',
            value: null,
            label: 'imo invite link',
            order: 19,
            isURL: 1,
          },
          // {
          //   name: 'IRC',
          //   icon: 'irc',
          //   href: 'irc:',
          //   placeholder: 'IRC ID',
          //   value: null,
          //   label: 'IRC ID',
          //   order: 20,
          //   isURL: 1,
          // },
        ],
        secondaryActions: [
          // todo: Fix Instagram gradient icon preview
          {
            name: 'Instagram',
            icon: 'instagram',
            href: 'https://instagram.com/',
            placeholder: 'username',
            value: null,
            color: '#ffffff',
            light: 1,
            gradientIcon: 1,
            label: 'Instagram username',
          },
          {
            name: 'Threads',
            icon: 'threads',
            href: 'https://www.threads.net/',
            placeholder: '@username',
            value: null,
            color: '#000000',
            label: 'Threads username',
          },
          {
            name: 'Bluesky',
            icon: 'bluesky',
            placeholder: 'https://bsky.app/profile/your-handle.bsky.social',
            value: null,
            color: '#1185fe',
            label: 'Bluesky profile URL',
          },
          {
            name: 'Pixelfed',
            icon: 'pixelfed',
            placeholder: 'https://pixelfed.social/username',
            value: null,
            color: '#8d59a8',
            label: 'Pixelfed profile URL',
          },
          {
            name: 'Facebook',
            icon: 'facebook',
            href: 'https://facebook.com/',
            placeholder: 'username or pagename',
            value: null,
            color: '#1877f2',
            label: 'Facebook username or pagename',
          },
          {
            name: 'Diaspora',
            icon: 'diaspora',
            placeholder: 'https://diaspora.social/username',
            value: null,
            color: '#000000',
            label: 'Diaspora profile URL',
          },
          {
            name: 'Friendica',
            icon: 'friendica',
            placeholder: 'https://friendica.social/username',
            value: null,
            color: '#1d6e9a',
            label: 'Friendica profile URL',
          },
          {
            name: 'X',
            icon: 'x-social',
            href: 'https://x.com/',
            placeholder: 'username',
            value: null,
            color: '#000000',
            label: 'X username',
          },
          {
            name: 'Mastodon',
            icon: 'mastodon',
            placeholder: 'https://mastodon.social/@username',
            value: null,
            color: '#2b90d9',
            label: 'Mastodon profile URL',
          },
          {
            name: 'LinkedIn',
            icon: 'linkedin',
            href: 'https://linkedin.com/',
            placeholder: 'in/username or company/companyname',
            value: null,
            color: '#0077b5',
            label: 'Linkedin username or companyname',
          },
          {
            name: 'YouTube',
            icon: 'youtube',
            href: 'https://youtube.com/',
            placeholder: 'channel name or ID',
            value: null,
            color: '#ff0000',
            label: 'Youtube channel name or ID',
          },
          {
            name: 'Vimeo',
            icon: 'vimeo',
            href: 'https://vimeo.com/',
            placeholder: 'channelname',
            value: null,
            color: '#1ab7ea',
            label: 'Vimeo channelname',
          },
          {
            name: 'PeerTube',
            icon: 'peertube',
            placeholder: 'https://peertube.video/channelname',
            value: null,
            color: '#ffffff',
            light: 1,
            label: 'PeerTube channel URL',
          },
          {
            name: 'Pinterest',
            icon: 'pinterest',
            href: 'https://pinterest.com/',
            placeholder: 'username',
            value: null,
            color: '#bd081c',
            label: 'Pinterest username',
          },
          {
            name: 'Behance',
            icon: 'behance',
            href: 'https://behance.net/',
            placeholder: 'username',
            value: null,
            color: '#1769ff',
            label: 'Behance username',
          },
          {
            name: 'Dribbble',
            icon: 'dribbble',
            href: 'https://dribbble.com/',
            placeholder: 'username',
            value: null,
            color: '#ea4c89',
            label: 'Dribbble username',
          },
          {
            name: 'Reddit',
            icon: 'reddit',
            href: 'https://reddit.com/',
            placeholder: 'username',
            value: null,
            color: '#ff5700',
            label: 'Reddit username',
          },
          {
            name: 'VK',
            icon: 'vk',
            href: 'https://vk.com/',
            placeholder: 'pagename',
            value: null,
            color: '#4a76a8',
            label: 'VK page URL',
          },
          {
            name: 'Snapchat',
            icon: 'snapchat',
            href: 'https://www.snapchat.com/add/',
            placeholder: 'username',
            value: null,
            color: '#fffc00',
            light: 1,
            label: 'Snapchat username',
          },
          {
            name: 'Tumblr',
            icon: 'tumblr',
            href: 'https://',
            hrefEnd: '.tumblr.com/',
            placeholder: 'username',
            value: null,
            color: '#2c4762',
            label: 'Tumblr blog URL',
          },
          {
            name: 'Quora',
            icon: 'quora',
            href: 'https://quora.com/',
            placeholder: 'username',
            value: null,
            color: '#a82400',
            label: 'Quora username',
          },
          {
            name: 'Medium',
            icon: 'medium',
            placeholder: 'https://medium.com/publication_name',
            value: null,
            color: '#000000',
            label: 'Medium publication',
          },
          {
            name: 'Substack',
            icon: 'substack',
            placeholder: 'https://publication.substack.com/',
            value: null,
            color: '#ff6719',
            label: 'Substack publication URL',
          },
          {
            name: 'Discord',
            icon: 'discord',
            placeholder: 'https://discord.gg/invitecode',
            value: null,
            color: '#7289da',
            label: 'Discord channel invite link',
          },
          {
            name: 'Twitch',
            icon: 'twitch',
            href: 'https://twitch.tv/',
            placeholder: 'username',
            value: null,
            color: '#9146ff',
            label: 'Twitch username',
          },
          {
            name: 'Spotify',
            icon: 'spotify',
            href: 'https://open.spotify.com/user/',
            placeholder: 'username',
            value: null,
            color: '#1ed760',
            label: 'Spotify username',
          },
          {
            name: 'SoundCloud',
            icon: 'soundcloud',
            href: 'https://soundcloud.com/',
            placeholder: 'username',
            value: null,
            color: '#ff3300',
            label: 'SoundCloud username',
          },
          {
            name: 'Funkwhale',
            icon: 'funkwhale',
            placeholder: 'https://funkwhale.audio/username',
            value: null,
            color: '#ffffff',
            light: 1,
            label: 'Funkwhale username',
          },
          {
            name: 'GitHub',
            icon: 'github',
            href: 'https://github.com/',
            placeholder: 'username',
            value: null,
            color: '#333',
            label: 'Github username',
          },
          {
            name: 'GitLab',
            icon: 'gitlab',
            href: 'https://gitlab.com/',
            placeholder: 'username',
            value: null,
            color: '#171321 ',
            label: 'Gitlab username',
          },
          {
            name: 'Codeberg',
            icon: 'codeberg',
            href: 'https://codeberg.org/',
            placeholder: 'username',
            value: null,
            color: '#2185d0',
            label: 'Codeberg username',
          },
          {
            name: 'Yelp',
            icon: 'yelp',
            href: 'https://yelp.com/',
            placeholder: 'bizname',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Yelp pagename',
          },
          // Full profile URLs rather than href prefixes: these services do not
          // expose one stable username-based path for every kind of listing.
          {
            name: 'Angi',
            icon: 'angi',
            placeholder: 'https://angi.com/companylist/us/...',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Angi business profile URL',
          },
          {
            name: 'Bark',
            icon: 'bark',
            placeholder: 'https://bark.com/en/us/company/...',
            value: null,
            color: '#121737',
            label: 'Bark professional profile URL',
          },
          {
            name: 'BuildZoom',
            icon: 'buildzoom',
            placeholder: 'https://buildzoom.com/contractor/...',
            value: null,
            color: '#03a2dd',
            label: 'BuildZoom contractor profile URL',
          },
          {
            name: 'Houzz',
            icon: 'houzz',
            placeholder: 'https://houzz.com/pro/username',
            value: null,
            color: '#4dbc15',
            label: 'Houzz profile URL',
          },
          {
            name: 'Thumbtack',
            icon: 'thumbtack',
            placeholder: 'https://thumbtack.com/.../service/123456',
            value: null,
            color: '#009fd9',
            label: 'Thumbtack profile URL',
          },
          {
            name: 'Networx',
            icon: 'networx',
            placeholder: 'https://networx.com/c....',
            value: null,
            // The Networx navy reads as near-black at chip size; its own
            // chevrons are this blue, and it matches Thumbtack's chip.
            color: '#009fd9',
            label: 'Networx contractor profile URL',
          },
          {
            name: 'Nextdoor',
            icon: 'nextdoor',
            placeholder: 'https://nextdoor.com/pages/business-name',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Nextdoor page URL',
          },
          {
            name: 'Porch',
            icon: 'porch',
            placeholder: 'https://porch.com/...',
            value: null,
            color: '#17313b',
            label: 'Porch professional profile URL',
          },
          {
            name: 'HomeAdvisor',
            icon: 'homeadvisor',
            placeholder: 'https://homeadvisor.com/rated.Business.123456',
            value: null,
            color: '#f68315',
            label: 'HomeAdvisor profile URL',
          },
          {
            name: 'Etsy',
            icon: 'etsy',
            href: 'https://etsy.com/shop/',
            placeholder: 'shopname',
            value: null,
            color: '#f16521',
            label: 'Etsy shop name',
          },
          {
            name: 'Amazon',
            icon: 'amazon',
            placeholder: 'https://amazon.com/shop/username',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Amazon shop or wish list URL',
          },
          {
            name: 'eBay',
            icon: 'ebay',
            href: 'https://ebay.com/usr/',
            placeholder: 'username',
            value: null,
            color: '#e53238',
            label: 'eBay username',
          },
          {
            name: 'PayPal',
            icon: 'paypal',
            href: 'https://paypal.me/',
            placeholder: 'username',
            value: null,
            color: '#003087',
            label: 'PayPal.me URL',
          },
          {
            name: 'Patreon',
            icon: 'patreon',
            href: 'https://patreon.com/',
            placeholder: 'username',
            value: null,
            color: '#FF424D',
            label: 'Patreon URL',
          },
          {
            name: 'Open Collective',
            icon: 'open-collective',
            href: 'https://opencollective.com/',
            placeholder: 'projectname',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Open Collective projectname',
          },
          {
            name: 'TikTok',
            icon: 'tiktok',
            href: 'https://tiktok.com/',
            placeholder: 'username',
            value: null,
            color: '#fff',
            light: 1,
            label: 'TikTok username',
          },
          {
            name: 'Cash App',
            icon: 'cashapp',
            href: 'https://cash.app/',
            placeholder: '$username',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Cash App username',
          },
          {
            name: 'Siilo',
            icon: 'siilo',
            href: 'https://app.siilo.com/qr/',
            placeholder: 'userID',
            value: null,
            color: '#17233b',
            label: 'Siilo userID',
          },
          {
            name: 'App Store',
            icon: 'appstore',
            placeholder: 'https://apps.apple.com/in/app/appname/id',
            value: null,
            color: 'linear-gradient(#5fc9f8, #147efb)',
            label: 'App Store developer/app URL',
          },
          {
            name: 'Play Store',
            icon: 'playstore',
            placeholder: 'https://play.google.com/store/apps/details?id=',
            value: null,
            color: '#fff',
            light: 1,
            label: 'Play Store developer/app URL',
          },
          {
            name: 'ArtStation',
            icon: 'artstation',
            href: 'https://www.artstation.com/',
            placeholder: 'username',
            value: null,
            color: '#171717',
            label: 'ArtStation username',
          },
          {
            name: 'Buy me a coffee',
            icon: 'buymeacoffee',
            href: 'https://www.buymeacoffee.com/',
            placeholder: 'username',
            value: null,
            color: '#ffdd00',
            light: 1,
            label: 'Buy me a coffee username',
          },
          {
            name: 'Ko-fi',
            icon: 'kofi',
            href: 'https://ko-fi.com/',
            placeholder: 'username',
            value: null,
            color: '#13c3ff',
            label: 'Ko-fi username',
          },
          // BIP-21 / OpenAlias URI schemes rather than a block-explorer link:
          // they hand the address straight to whichever wallet the visitor has
          // registered, and degrade to nothing when they have none.
          {
            name: 'Bitcoin',
            icon: 'bitcoin',
            href: 'bitcoin:',
            placeholder: 'bc1...',
            value: null,
            color: '#f7931a',
            label: 'Bitcoin address',
          },
          {
            name: 'Monero',
            icon: 'monero',
            href: 'monero:',
            placeholder: '4...',
            value: null,
            color: '#ff6600',
            label: 'Monero address',
          },
        ],
      } as CardActions,
      featured: [
        {
          title: 'Section title',
          content: [],
        },
      ] as FeaturedSection[],
      hostedURL: null as string | null,
      footerCredit: true,
      PreviewMode: true,
      /** Body of the alert modal; null hides it. */
      content: null as string | null,
      inView: false,
      showPreview: false,
      scrollPos: null as number | null,
      opening: false,
    }
  },
  computed: {
    getFullname() {
      let fn = this.genInfo.fname
      let ln = this.genInfo.lname
      return (fn + ln).length > 0
        ? `${fn ? fn : ''}${ln ? ' ' + ln : ''}`
        : null
    },
    pubKeyIsValid() {
      if (this.genInfo.key) {
        if (!/^(-----BEGIN PGP PUBLIC KEY BLOCK-----)/.test(this.genInfo.key))
          return false

        if (!/(-----END PGP PUBLIC KEY BLOCK-----)$/.test(this.genInfo.key))
          return false

        return true
      }
      return false
    },
    downloadChecked() {
      return this.downloadCheckList.filter((e) => e.checked).length === 3
    },
    username() {
      return this.getFullname
        ? this.getFullname.toLowerCase().replaceAll(/\W+/g, '')
        : 'username'
    },
    orderedPrimaryActions() {
      return this.actions.primaryActions.toSorted((a, b) =>
        a.order > b.order ? 1 : a.order < b.order ? -1 : 0,
      )
    },
    filteredPrimaryActions() {
      return this.orderedPrimaryActions.filter((e) =>
        e.name.toLowerCase().includes(this.filterPrimary.toLowerCase()),
      )
    },
    orderedSecondaryActions() {
      return this.actions.secondaryActions.toSorted((a, b) =>
        a.name.localeCompare(b.name),
      )
    },
    secondaryActionCategories() {
      return SECONDARY_ACTION_CATEGORIES
    },
    fontPresets() {
      return FONT_PRESETS
    },
    secondaryResultsLabel() {
      if (this.filterSecondary) return `Results for “${this.filterSecondary}”`
      return (
        SECONDARY_ACTION_CATEGORIES.find(
          (category) => category.id === this.secondaryCategory,
        )?.label ?? 'Profiles'
      )
    },
    filteredSecondaryActions() {
      const query = this.filterSecondary.trim().toLowerCase()
      if (query)
        return this.orderedSecondaryActions.filter((action) =>
          action.name.toLowerCase().includes(query),
        )

      const available = new Map(
        this.actions.secondaryActions.map((action) => [action.name, action]),
      )
      const names =
        this.secondaryCategory === 'popular'
          ? POPULAR_SECONDARY_ACTIONS
          : SECONDARY_ACTION_GROUPS[
              this.secondaryCategory as SecondaryActionCategory
            ]
      return names
        .map((name) => available.get(name))
        .filter(Boolean) as SecondaryAction[]
    },
    vCard() {
      // The `&& e.value` is not redundant: the original mapped to the value and
      // then filtered on truthiness, so an action of the right name carrying an
      // empty value was skipped in favour of a later one that had a value.
      const findValue = (name: string) =>
        this.primaryActions.find((e) => e.name === name && e.value)?.value
      const getNumber = (type) => {
        let no = findValue(type)
        return no ? no.replaceAll(/\s/g, '') : null
      }
      let email = findValue('Email')
      let website = findValue('Website')
      let actions = [
        ...this.primaryActions,
        ...this.secondaryActions.map((e) => {
          return { ...e, isURL: 1 }
        }),
      ]
      let urls = actions
        .map((e) => {
          if (e.isURL && e.value) {
            return {
              title: e.name,
              url:
                (e.href ? e.href : '') + e.value + (e.hrefEnd ? e.hrefEnd : ''),
            }
          }
          return false
        })
        .filter(Boolean)

      let note = this.genInfo.desc
        ? this.genInfo.desc.replaceAll(/[\r\n]+/gm, '')
        : null
      let key = this.pubKeyIsValid ? window.btoa(this.genInfo.key) : null
      let randomNumber = Math.floor(100000000 + Math.random() * 900000)
      return {
        fn: this.genInfo.fname,
        ln: this.genInfo.lname,
        title: this.genInfo.title,
        org: this.genInfo.biz,
        addr: this.genInfo.addr,
        cell: getNumber('Mobile'),
        work: getNumber('Office'),
        home: getNumber('Home'),
        sms: getNumber('SMS'),
        email,
        hostedURL: this.hostedURL,
        website,
        urls,
        key,
        note,
        uid: `EnBizCard-${randomNumber}`,
      }
    },
  },
  methods: {
    changeTheme(value) {
      this.theme = value
    },
    selectFontPreset(id: string) {
      this.fontPreset = id
      // 'custom' only reveals the two fields; it deliberately leaves whatever
      // is in them alone, so switching to it after picking a preset gives the
      // user that preset's markup to edit rather than a blank box.
      if (id === 'custom') return
      const preset = FONT_PRESETS.find((p) => p.id === id)
      if (!preset) return
      // Empty string means "no web font" — store null, which is what an
      // untouched card carries and what Preview.vue's checks expect.
      this.genInfo.fontLink = preset.link || null
      this.genInfo.fontCss = preset.css || null
    },
    togglePreview() {
      this.opening = true
      let c = this.$refs.container
      if (this.showPreview) {
        c.classList.remove('overflow-y-hidden', 'h-screen')
        window.scrollTo(0, this.scrollPos)
        this.opening = false
      } else {
        this.scrollPos = window.scrollY
        setTimeout(() => {
          c.classList.add('overflow-y-hidden', 'h-screen')
          this.opening = false
        }, 400)
      }
      this.showPreview = !this.showPreview
    },
    checkView() {
      let e = this.$refs.create
      if (e) {
        let top = e.getBoundingClientRect().top
        this.inView = this.showPreview ? true : top < 0
      }
    },
    clearContent() {
      this.content = null
    },
    create() {
      this.$refs.create.scrollIntoView({ behavior: 'smooth' })
    },
    getTitle(e) {
      return e.toLowerCase().split(' ').join('_')
    },
    addFeature() {
      this.featured.push({
        title: 'Section title',
        content: [],
      })
    },
    hasLightBG(e) {
      let hex = this.colors[e].color
      hex = hex.slice(1)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      let r = Number.parseInt(hex.slice(0, 2), 16)
      let g = Number.parseInt(hex.slice(2, 4), 16)
      let b = Number.parseInt(hex.slice(4, 6), 16)
      // r/g/b are already numbers; the parseInt() that used to wrap each of
      // them here was re-parsing its own output.
      const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
      return brightness > 125
    },
    showAlert(content) {
      this.content = content
    },
    clearFilterActions() {
      this.filterPrimary = this.filterSecondary = ''
    },
    filteredAction(filterType, actionType) {
      if (this[filterType].length > 0)
        this.addAction(actionType, this[filterType][0].name)
      this.clearFilterActions()
    },
    addAction(type, name) {
      let index = this.actions[type].findIndex((e) => e.name === name)
      this[type].push(this.actions[type][index])
      this.actions[type].splice(index, 1)
      this.clearFilterActions()
    },
    removeAction(type, index) {
      this.actions[type].unshift(this[type][index])
      this[type].splice(index, 1)
    },
    downloadVcard() {
      let blob = new Blob([this.$refs.vCard.$refs.vCard.innerText], {
        type: 'text/plain',
      })
      saveAs(window.URL.createObjectURL(blob), `${this.username}.vcf`)
    },
    downloadKey() {
      let blob = new Blob([this.genInfo.key], {
        type: 'text/plain',
      })
      saveAs(
        window.URL.createObjectURL(blob),
        `${this.getFullname}'s public key.asc`,
      )
    },
    async resizeImage(
      type: ResizeTarget,
      mime: string,
      index1?: number,
      index2?: number,
    ) {
      let reader = new FileReader()
      let file
      if (index2 >= 0) {
        if (type === 'image') {
          file = await this.featured[index1].content[index2].file
        } else if (type === 'music') {
          file = await this.featured[index1].content[index2].cover
        } else if (type === 'product') {
          file = await this.featured[index1].content[index2].image.file
        }
      } else {
        file = await this.images[type].blob
      }
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      let img = document.createElement('img')
      let maxWidth, maxHeight
      reader.onerror = () => {
        this.showAlert('Could not read that image. The file may be unreadable.')
      }
      reader.onload = (e) => {
        img.src = e.target.result
        // Without this a data URI the browser cannot decode leaves `resized`
        // null forever, which the export then refuses to package.
        img.onerror = () => {
          this.showAlert(
            'Could not process that image. It may be corrupt or too large.',
          )
        }
        img.onload = () => {
          if (type === 'photo') {
            canvas.width = canvas.height = 320
          } else {
            if (type === 'logo') {
              maxWidth = 960
              maxHeight = 192
            } else {
              maxWidth = maxHeight = 960
            }
            let width = img.width
            let height = img.height

            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
            if (height > maxHeight) {
              width *= maxHeight / height
              height = maxHeight
            }
            canvas.width = width
            canvas.height = height
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(
            (blob) => {
              let image = new File([blob], type, {
                type: mime,
              })
              if (index2 >= 0) {
                if (type === 'image') {
                  this.featured[index1].content[index2].file = image
                } else if (type === 'music') {
                  this.featured[index1].content[index2].cover = image
                } else if (type === 'product') {
                  this.featured[index1].content[index2].image.file = image
                }
              } else {
                this.images[type].resized = image
              }
            },
            mime,
            0.8,
          )
        }
      }
      reader.readAsDataURL(file)
    },
    getTrackingCode() {
      let regex = /<script[^<]*<\/script>/g
      let tracker = this.genInfo.tracker
      if (regex.test(tracker)) {
        let scripts = tracker.match(regex)
        let temp = document.createElement('div')
        temp.innerHTML = tracker
        return scripts.length > 0 && temp
      }
      return false
    },
    downloadPackage() {
      if (!this.downloadChecked) {
        this.showAlert('Please confirm every item in the checklist first.')
        return
      }
      this.PreviewMode = false
      setTimeout(() => {
        try {
          this.buildPackage()
        } catch (err) {
          this.showAlert(
            `Could not build your card package.\n\n${errorText(err)}`,
          )
        } finally {
          // Always restore the editor. Leaving PreviewMode false strands the
          // preview on the export's relative ./media/ paths, with no way back
          // short of a reload that would discard the card.
          this.PreviewMode = true
        }
      }, 250)
    },
    /**
     * Serialises the live preview into the downloadable zip. Throws on
     * failure; downloadPackage() is what reports it and restores the editor.
     */
    buildPackage() {
      let el = new DOMParser().parseFromString(
        this.$refs.html.$refs.html.outerHTML,
        'text/html',
      )

      // Inject the trailing-slash redirect. It lives here rather than in
      // Preview.vue's template so it cannot run inside the generator.
      let redirect = document.createElement('script')
      redirect.textContent =
        '"http"==window.location.href.substr(0,4)&&"/"!=window.location.href.slice(-1)&&window.location.replace(window.location.href+"/");'
      el.querySelector('head').append(redirect)

      // Inject stylesheets
      let styleLink = document.createElement('link')
      styleLink.rel = 'stylesheet'
      styleLink.href = './style.min.css'
      el.querySelector('head').append(styleLink)

      // Inject qrcode script
      let qrcode = document.createElement('script')
      qrcode.src = './qrcode.min.js'
      el.querySelector('body').append(qrcode)

      // Inject general script
      let modals = document.createElement('script')
      modals.innerText = modalScript
      el.querySelector('body').append(modals)

      // Inject media script
      let mediaHandler = document.createElement('script')
      mediaHandler.innerText = mediaScript
      if (this.featured.length > 0)
        el.querySelector('body').append(mediaHandler)

      // Inject tracking scripts. getTrackingCode() returns false/0 or a
      // detached <div> holding the user's snippet. Spreading childNodes takes a
      // static copy first, because append() moves each node out of that div.
      let tracker = this.getTrackingCode()
      if (tracker) el.head.append(...tracker.childNodes)

      // Create blobs
      let html = new Blob([`<!DOCTYPE html>${el.documentElement.outerHTML}`], {
        type: 'text/html',
      })
      let theme
      switch (this.theme) {
        case 2:
          theme = Theme2
          break
        case 3:
          theme = Theme3
          break
        // Theme 1 is the default. Without this branch an unexpected value left
        // `theme` as the number it was initialised to, and the exported card
        // shipped a style.min.css containing literally "1".
        default:
          theme = Theme1
      }
      let css = new Blob([theme], {
        type: 'text/css',
      })
      let vCard = new Blob([this.$refs.vCard.$refs.vCard.innerText], {
        type: 'text/plain',
      })
      let guide = new Blob(
        [
          '<html><head><meta http-equiv="refresh" content="0; url=https://enbizcard.vishnuraghav.com/hosting-guide" /></head></html>',
        ],
        {
          type: 'text/html',
        },
      )
      let qrScript = new Blob([QRCode], {
        type: 'application/javascript',
      })

      // Prepare files
      let username = this.username
      let zip = new JSZip()
      zip.folder(username).file('index.html', html)
      zip.folder(username).file('style.min.css', css)
      zip.folder(username).file('qrcode.min.js', qrScript)
      zip.file('Hosting-Guide.html', guide)

      // Image attachments. `resized` is produced asynchronously by
      // resizeImage()'s canvas.toBlob, so it can still be null here if the
      // user cropped and hit Download immediately, or if the resize failed.
      // JSZip writes falsy data as a 0-byte entry without complaining, which
      // ships a card with a broken image the user only discovers after
      // uploading it — so refuse instead. downloadPackage() shows the message.
      for (const key in this.images) {
        if (this.images[key].url) {
          if (!this.images[key].resized) {
            throw new Error(
              `The ${key} image is still being processed. Wait a moment and try again.`,
            )
          }
          zip
            .folder(username)
            .file(`${key}.${this.images[key].ext}`, this.images[key].resized)
        }
      }

      // Featured content
      let hasFeaturedContent = this.featured.filter(
        (e) => e.content.length,
      ).length
      if (hasFeaturedContent) {
        this.featured.forEach((section) => {
          section.content.forEach((item) => {
            if (item.contentType === 'media') {
              zip
                .folder(username)
                .folder('media')
                .file(`${this.getTitle(item.title)}.${item.ext}`, item.file)
              if (/music|document/gi.test(item.type)) {
                if (!item.info) {
                  zip
                    .folder(username)
                    .folder('media')
                    .file(
                      `${this.getTitle(item.title)}.${item.coverExt}`,
                      item.cover,
                    )
                }
              }
            } else if (item.contentType === 'product' && item.image) {
              zip
                .folder(username)
                .folder('media')
                .file(
                  `${this.getTitle(item.image.title)}.${item.image.ext}`,
                  item.image.file,
                )
            }
          })
        })
      }

      //  Public key
      let name = this.getFullname
      if (this.pubKeyIsValid) {
        zip.folder(username).file(`${name}'s public key.asc`, this.genInfo.key)
      }

      // VCARD
      zip.folder(username).file(`${username}.vcf`, vCard)

      // Final ZIP file. JSZip defers reading every file it was handed until
      // generateAsync(), so this is where an unreadable blob surfaces — and
      // it rejects rather than throwing, so the try/catch around this method
      // cannot see it. Without the catch the user clicks Download and simply
      // nothing happens.
      zip
        .generateAsync({
          type: 'blob',
        })
        .then((blob) => {
          saveAs(blob, `${name}'s Digital Business Card.zip`)
        })
        .catch((err) => {
          this.showAlert(
            `Could not build your card package.\n\n${errorText(err)}`,
          )
        })
    },
  },
  mounted() {
    window.addEventListener('scroll', this.checkView)
    // window.onbeforeunload = function () {
    //   return 'Your work will be lost.'
    // }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.checkView)
  },
})
</script>
