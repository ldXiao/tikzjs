import {
  TikzInline,
  TikzPicture,
  TikzRoot,
  TikzLiteral,
  TikzPath,
  TikzPathOperation,
  TikzOption,
  TikzLineOperation,
  TikzCoordinate,
  TikzCoordinateOffset,
  TikzCd,
  TikzCdRow,
  TikzCdCell,
  TikzCdArrow,
} from './TikzRoot'

const factory = {
  tikzRoot: TikzRoot,
  tikzInline: TikzInline,
  tikzPicture: TikzPicture,
  tikzLiteral: TikzLiteral,
  tikzPath: TikzPath,
  tikzCoordinate: TikzCoordinate,
  tikzCoordinateOffset: TikzCoordinateOffset,
  tikzPathOperation: TikzPathOperation,
  tikzLineOperation: TikzLineOperation,
  tikzOption: TikzOption,
  tikzCd: TikzCd,
  tikzCdRow: TikzCdRow,
  tikzCdCell: TikzCdCell,
  tikzCdArrow: TikzCdArrow,
}

export default factory
