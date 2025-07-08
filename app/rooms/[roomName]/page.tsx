import * as React from 'react';
import { PageClientImpl } from '@/lib/PageClientImpl';
import { isVideoCodec } from '@/lib/types';
import { ConnectionProvider } from '@/lib/Context/ConnectionContext';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ roomName: string }>;
  searchParams: Promise<{
    // FIXME: We should not allow values for regions if in playground mode.
    region?: string;
    hq?: string;
    codec?: string;
    userEmail?: string;
  }>;
}) {
  const _params = await params;
  const _searchParams = await searchParams;
  const codec =
    typeof _searchParams.codec === 'string' && isVideoCodec(_searchParams.codec)
      ? _searchParams.codec
      : 'vp9';
  const hq = _searchParams.hq === 'true' ? true : false;

  return (
    <ConnectionProvider>
      <PageClientImpl
        roomName={_params.roomName}
        region={_searchParams.region}
        hq={hq}
        codec={codec}
        userEmail={_searchParams.userEmail}
      />
    </ConnectionProvider>
  );
}
