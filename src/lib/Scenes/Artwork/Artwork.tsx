import { Box, Theme } from "@artsy/palette"
import { Artwork_artwork } from "__generated__/Artwork_artwork.graphql"
import { ArtworkQuery } from "__generated__/ArtworkQuery.graphql"
import Separator from "lib/Components/Separator"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import { SafeAreaInsets } from "lib/types/SafeAreaInsets"
import renderWithLoadProgress from "lib/utils/renderWithLoadProgress"
import React from "react"
import { FlatList } from "react-native"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"
import { AboutArtistFragmentContainer as AboutArtist } from "./Components/AboutArtist"
import { AboutWorkFragmentContainer as AboutWork } from "./Components/AboutWork"
import { ArtworkDetailsFragmentContainer as ArtworkDetails } from "./Components/ArtworkDetails"
import { ArtworkHeaderFragmentContainer as ArtworkHeader } from "./Components/ArtworkHeader"
import { ArtworkHistoryFragmentContainer as ArtworkHistory } from "./Components/ArtworkHistory"
import { CommercialInformationFragmentContainer as CommercialInformation } from "./Components/CommercialInformation"
import { ContextCardFragmentContainer as ContextCard } from "./Components/ContextCard"
import { OtherWorksFragmentContainer as OtherWorks, populatedGrids } from "./Components/OtherWorks"
import { PartnerCardFragmentContainer as PartnerCard } from "./Components/PartnerCard"

interface Props {
  artwork: Artwork_artwork
  safeAreaInsets: SafeAreaInsets
}

export class Artwork extends React.Component<Props> {
  shouldRenderDetails = () => {
    const {
      category,
      conditionDescription,
      signature,
      signatureInfo,
      certificateOfAuthenticity,
      framed,
      series,
      publisher,
      manufacturer,
      image_rights,
    } = this.props.artwork
    if (
      category ||
      conditionDescription ||
      signature ||
      signatureInfo ||
      certificateOfAuthenticity ||
      framed ||
      series ||
      publisher ||
      manufacturer ||
      image_rights
    ) {
      return true
    } else {
      return false
    }
  }

  shouldRenderPartner = () => {
    const { partner, sale } = this.props.artwork
    if ((sale && sale.isBenefit) || (sale && sale.isGalleryAuction)) {
      return false
    } else if (partner && partner.type && partner.type !== "Auction House") {
      return true
    } else {
      return false
    }
  }

  shouldRenderOtherWorks = () => {
    const { contextGrids } = this.props.artwork
    const gridsToShow = populatedGrids(contextGrids)

    if (gridsToShow && gridsToShow.length > 0) {
      return true
    } else {
      return false
    }
  }

  sections = () => {
    const { artwork } = this.props
    const {
      artist: { biography_blurb },
      context,
    } = artwork

    const sections = []

    sections.push("header")
    sections.push("commercialInformation")

    if (artwork.description || artwork.additional_information) {
      sections.push("aboutWork")
    }

    if (this.shouldRenderDetails()) {
      sections.push("details")
    }

    if (artwork.provenance || artwork.exhibition_history || artwork.literature) {
      sections.push("history")
    }

    if (biography_blurb) {
      sections.push("aboutArtist")
    }

    if (this.shouldRenderPartner()) {
      sections.push("partnerCard")
    }

    if (context) {
      sections.push("contextCard")
    }

    if (this.shouldRenderOtherWorks()) {
      sections.push("otherWorks")
    }

    return sections
  }

  renderItem = ({ item: section }) => {
    const { artwork } = this.props
    switch (section) {
      case "header":
        return <ArtworkHeader artwork={artwork} />
      case "commercialInformation":
        return <CommercialInformation artwork={artwork} />
      case "aboutWork":
        return <AboutWork artwork={artwork} />
      case "details":
        return <ArtworkDetails artwork={artwork} />
      case "history":
        return <ArtworkHistory artwork={artwork} />
      case "aboutArtist":
        return <AboutArtist artwork={artwork} />
      case "partnerCard":
        return <PartnerCard artwork={artwork} />
      case "contextCard":
        return <ContextCard artwork={artwork} />
      case "otherWorks":
        return <OtherWorks artwork={artwork} />
      default:
        return null
    }
  }

  render() {
    return (
      <Theme>
        <Box>
          <FlatList
            data={this.sections()}
            ItemSeparatorComponent={() => (
              <Box px={2} mx={2} my={3}>
                <Separator />
              </Box>
            )}
            style={{ paddingTop: this.props.safeAreaInsets.top }}
            keyExtractor={(item, index) => item.type + String(index)}
            renderItem={item =>
              item.item === "header" ? this.renderItem(item) : <Box px={2}>{this.renderItem(item)}</Box>
            }
          />
        </Box>
      </Theme>
    )
  }
}

export const ArtworkContainer = createFragmentContainer(Artwork, {
  artwork: graphql`
    fragment Artwork_artwork on Artwork {
      additional_information
      description
      provenance
      exhibition_history
      literature

      partner {
        type
        id
      }

      artist {
        name
        biography_blurb {
          text
        }
      }

      # Partner Card
      sale {
        isBenefit
        isGalleryAuction
      }

      # Details
      category
      conditionDescription {
        details
      }
      signature
      signatureInfo {
        details
      }
      certificateOfAuthenticity {
        details
      }
      framed {
        details
      }
      series
      publisher
      manufacturer
      image_rights

      # For ContextCard
      context {
        __typename
      }

      ...PartnerCard_artwork
      ...AboutWork_artwork
      ...OtherWorks_artwork @relay(mask: false)
      ...OtherWorks_artwork
      ...AboutArtist_artwork
      ...ArtworkDetails_artwork
      ...ContextCard_artwork
      ...ArtworkHeader_artwork
      ...CommercialInformation_artwork
      ...ArtworkHistory_artwork
    }
  `,
})

export const ArtworkRenderer: React.SFC<{ artworkID: string; safeAreaInsets: SafeAreaInsets }> = ({
  artworkID,
  ...others
}) => {
  return (
    <QueryRenderer<ArtworkQuery>
      environment={defaultEnvironment}
      query={graphql`
        query ArtworkQuery($artworkID: String!) {
          artwork(id: $artworkID) {
            ...Artwork_artwork
          }
        }
      `}
      variables={{
        artworkID,
      }}
      render={renderWithLoadProgress(ArtworkContainer, others)}
    />
  )
}
