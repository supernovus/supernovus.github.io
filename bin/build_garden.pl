#!/usr/bin/perl

use Modern::Perl;
use Garden;
use JSON;

sub slurp {
  my $filename = shift;
  my $text = do { local( @ARGV, $/ ) = $filename ; <> } ;
  return $text;
}

sub output_html {
  my ($page, $html) = @_;
  my $outfile = "$page.html";
  open(my $file, '>', $outfile);
  print $file $html;
  close $file;
}

my $config = decode_json(slurp('./garden/releases.json'));
my $garden = Garden->new(paths=>['./src']);

my $tocpage = $garden->get('garden');
my $tochtml = $tocpage->render(versions=>$config);
output_html('garden/index', $tochtml);

say "Done building page.";

