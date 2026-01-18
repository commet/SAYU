import NextErrorComponent, { ErrorProps } from 'next/error'
import { NextPageContext } from 'next'

const CustomErrorComponent = (props: ErrorProps) => {
  return <NextErrorComponent statusCode={props.statusCode} />
}

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  return NextErrorComponent.getInitialProps(contextData)
}

export default CustomErrorComponent