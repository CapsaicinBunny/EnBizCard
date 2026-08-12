<template>
  <pre v-show="false" ref="vCard">
BEGIN:VCARD
VERSION:3.0
N:{{ getSplitName }}
FN:{{ getFullname }}
ORG:{{ vCard.org }}
ADR;TYPE=WORK:{{ vCard.addr }}
TITLE:{{ vCard.title }}
{{ getPhones }}
TEL;TYPE=MSG:{{ vCard.sms }}
{{ getEmails }}
URL;TYPE=Digital Business Card:{{ vCard.hostedURL }}
URL:{{ vCard.website }}
{{ getURLs }}
KEY;TYPE=PGP;ENCODING=b:{{ vCard.key }}
NOTE:{{ vCard.note }}
UID:{{ vCard.uid }}
END:VCARD</pre>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { VCardData } from '~/types/card'

export default defineComponent({
  props: {
    vCard: { type: Object as PropType<VCardData>, required: true },
  },
  computed: {
    /**
     * One line per filled phone / email. Built as joined strings rather than
     * a v-for so the surrounding <pre> keeps exactly one newline per entry —
     * a v-for would leave the template's own indentation in the .vcf.
     */
    getPhones(): string {
      return this.vCard.phones
        .map((e) => `TEL;TYPE=${e.type}:${e.value}`)
        .join('\n')
    },
    getEmails(): string {
      return this.vCard.emails
        .map((e) => `EMAIL;TYPE=${e.type}:${e.value}`)
        .join('\n')
    },
    getURLs(): string {
      return this.vCard.urls
        .map((e) => `URL;TYPE=${e.title}:${e.url}`)
        .join('\n')
    },
    getSplitName(): string {
      let fn = this.vCard.fn
      let ln = this.vCard.ln
      return `${ln ? ln : ''};${fn ? fn : ''};;;`
    },
    getFullname(): string | null {
      let fn = this.vCard.fn
      let ln = this.vCard.ln
      return (fn + ln).length > 0
        ? `${fn ? fn : ''}${ln ? ' ' + ln : ''}`
        : null
    },
  },
})
</script>
